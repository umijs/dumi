import type { IThemeLoadResult } from '@/features/theme/loader';
import { getCache, getFileContentByRegExp, getFileRangeLines } from '@/utils';
import fs from 'fs';
import { lodash, Mustache } from 'umi/plugin-utils';
import transform, {
  type IMdTransformerOptions,
  type IMdTransformerResult,
} from './transformer';

interface IMdLoaderDefaultModeOptions
  extends Omit<IMdTransformerOptions, 'fileAbsPath'> {
  mode?: 'markdown';
  builtins: IThemeLoadResult['builtins'];
}

interface IMdLoaderDemosModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'meta';
  onResolveDemos?: (demos: IMdTransformerResult['meta']['demos']) => void;
}

export type IMdLoaderOptions =
  | IMdLoaderDefaultModeOptions
  | IMdLoaderDemosModeOptions;

const deferrer: { [key: string]: Promise<string> | undefined } = {};

export default async function mdLoader(this: any, raw: string) {
  const opts: IMdLoaderOptions = this.getOptions();
  const cb = this.async();
  const params = new URLSearchParams(this.resourceQuery);

  const cache = getCache('md-loader');
  const cacheKey = [
    this.resourcePath,
    fs.statSync(this.resourcePath).mtimeMs,
    JSON.stringify(params),
    JSON.stringify(opts),
  ].join(':');
  const cacheRet = cache.getSync(cacheKey, '');

  // file cache
  if (cacheRet) {
    cb(null, cacheRet);
    return;
  } else if (deferrer[cacheKey]) {
    // meme cache
    const memoRet = await deferrer[cacheKey];
    cb(null, memoRet);
    return;
  }

  let content = raw;
  const range = params.get('range');
  const regexp = params.get('regexp');
  // extract content of markdown file
  if (range) {
    content = getFileRangeLines(content, range);
  } else if (regexp) {
    content = getFileContentByRegExp(content, regexp, this.resourcePath);
  }

  deferrer[cacheKey] = new Promise<string>((resolve) => {
    transform(content, {
      ...(lodash.omit(opts, ['mode', 'builtins']) as Omit<
        IMdLoaderOptions,
        'mode' | 'builtins'
      >),
      fileAbsPath: this.resourcePath,
    }).then((ret) => {
      let result;
      if (opts.mode === 'meta') {
        const { demos, frontmatter, toc, embeds = [] } = ret.meta;

        // declare embedded files as loader dependency, for clear cache when file changed
        embeds.forEach((file) => this.addDependency(file));

        // apply demos resolve hook
        if (demos && opts.onResolveDemos) {
          opts.onResolveDemos(demos);
        }

        result = Mustache.render(
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
export const toc = {{{toc}}}
`,
          {
            demos,
            frontmatter: JSON.stringify(frontmatter),
            toc: JSON.stringify(toc),
            renderAsset: function renderAsset(
              this: NonNullable<typeof demos>[0],
            ) {
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
        // do not wrap DumiPage for fragment content (tab, embed)
        const isFragment = Boolean(
          this.resourcePath.includes('$tab-') || this.resourceQuery,
        );

        result =
          // import all builtin components, may be used by markdown content
          `${Object.values(opts.builtins)
            .map((item) => `import ${item.specifier} from '${item.source}';`)
            .join('\n')}
import React from 'react';${
            isFragment ? '' : `\nimport { DumiPage } from 'dumi'`
          }

// export named function for fastRefresh
// ref: https://github.com/pmmmwh/react-refresh-webpack-plugin/blob/main/docs/TROUBLESHOOTING.md#edits-always-lead-to-full-reload
function DumiMarkdownContent() {
  return ${isFragment ? ret.content : `<DumiPage>${ret.content}</DumiPage>`};
}

export default DumiMarkdownContent;`;
      }

      resolve(result);
      cache.setSync(cacheKey, result);
      cb(null, result);
    }, cb);
  });
}
