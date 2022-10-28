import { isTabRouteFile } from '@/features/tabs';
import type { IThemeLoadResult } from '@/features/theme/loader';
import { getCache } from '@/utils';
import fs from 'fs';
import { lodash, Mustache } from 'umi/plugin-utils';
import transform, {
  type IMdTransformerOptions,
  type IMdTransformerResult,
} from './transformer';
import { CONTENT_TEXTS_OBJ_NAME } from './transformer/rehypeText';

interface IMdLoaderDefaultModeOptions
  extends Omit<IMdTransformerOptions, 'fileAbsPath'> {
  mode?: 'markdown';
  builtins: IThemeLoadResult['builtins'];
}

interface IMdLoaderDemosModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'meta';
  onResolveDemos?: (
    demos: NonNullable<IMdTransformerResult['meta']['demos']>,
  ) => void;
}

export type IMdLoaderOptions =
  | IMdLoaderDefaultModeOptions
  | IMdLoaderDemosModeOptions;

function emit(this: any, opts: IMdLoaderOptions, ret: IMdTransformerResult) {
  if (opts.mode === 'meta') {
    const { demos, frontmatter, toc, texts, embeds = [] } = ret.meta;

    // declare embedded files as loader dependency, for clear cache when file changed
    embeds.forEach((file) => this.addDependency(file));

    // apply demos resolve hook
    if (demos && opts.onResolveDemos) {
      opts.onResolveDemos(demos);
    }

    return Mustache.render(
      `import React from 'react';

export const demos = {
  {{#demos}}
  '{{{id}}}': {
    component: {{{component}}},
    asset: {{{renderAsset}}}
  },
  {{/demos}}
};
export const frontmatter = {{{frontmatter}}};
export const toc = {{{toc}}};
export const texts = {{{texts}}};
`,
      {
        demos,
        frontmatter: JSON.stringify(frontmatter),
        toc: JSON.stringify(toc),
        texts: JSON.stringify(texts),
        renderAsset: function renderAsset(this: NonNullable<typeof demos>[0]) {
          // do not render asset for inline demo
          if (!('asset' in this)) return 'null';

          // render asset for normal demo
          let { asset } = this;
          const { sources } = this;

          // use raw-loader to load all source files
          Object.keys(this.sources).forEach((file: string) => {
            // to avoid modify original asset object
            asset = lodash.cloneDeep(asset);
            asset.dependencies[
              file
            ].value = `{{{require('!!raw-loader!${sources[file]}?raw').default}}}`;
          });

          return JSON.stringify(asset, null, 2).replace(/"{{{|}}}"/g, '');
        },
      },
    );
  } else {
    // do not wrap DumiPage for tab content
    const isTabContent = isTabRouteFile(this.resourcePath);

    // import all builtin components, may be used by markdown content
    return `${Object.values(opts.builtins)
      .map((item) => `import ${item.specifier} from '${item.source}';`)
      .join('\n')}
import React from 'react';
${
  isTabContent
    ? `import { useTabMeta } from 'dumi';`
    : `import { DumiPage, useRouteMeta } from 'dumi';`
}

// export named function for fastRefresh
// ref: https://github.com/pmmmwh/react-refresh-webpack-plugin/blob/main/docs/TROUBLESHOOTING.md#edits-always-lead-to-full-reload
function DumiMarkdownContent() {
  const { texts: ${CONTENT_TEXTS_OBJ_NAME} } = use${
      isTabContent ? 'TabMeta' : 'RouteMeta'
    }();
  return ${isTabContent ? ret.content : `<DumiPage>${ret.content}</DumiPage>`};
}

export default DumiMarkdownContent;`;
  }
}

const deferrer: Record<string, Promise<IMdTransformerResult>> = {};

export default function mdLoader(this: any, content: string) {
  const opts: IMdLoaderOptions = this.getOptions();
  const cb = this.async();

  const cache = getCache('md-loader');
  const cacheKey = [
    this.resourcePath,
    fs.statSync(this.resourcePath).mtimeMs,
    JSON.stringify(lodash.omit(opts, ['mode', 'builtins', 'onResolveDemos'])),
  ].join(':');
  const cacheRet = cache.getSync(cacheKey, '');

  if (cacheRet) {
    // file cache
    cb(null, emit.call(this, opts, cacheRet));
    return;
  } else if (cacheKey in deferrer) {
    // deferrer cache
    deferrer[cacheKey].then((res) => {
      cb(null, emit.call(this, opts, res));
    });
    return;
  }

  // share deferrer for same cache key
  deferrer[cacheKey] = new Promise<IMdTransformerResult>((resolve) => {
    transform(content, {
      ...(lodash.omit(opts, ['mode', 'builtins', 'onResolveDemos']) as Omit<
        IMdLoaderOptions,
        'mode' | 'builtins' | 'onResolveDemos'
      >),
      fileAbsPath: this.resourcePath,
    }).then((ret) => {
      cache.setSync(cacheKey, ret);
      resolve(ret);
      cb(null, emit.call(this, opts, ret));
    }, cb);
  });
}
