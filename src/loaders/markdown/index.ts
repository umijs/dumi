import { isTabRouteFile } from '@/features/tabs';
import type { IThemeLoadResult } from '@/features/theme/loader';
import { getCache, getContentHash } from '@/utils';
import fs from 'fs';
import { Mustache, lodash, winPath } from 'umi/plugin-utils';
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
  onResolveAtomMeta?: (
    atomId: string,
    meta: IMdTransformerResult['meta']['frontmatter'],
  ) => void;
}

export type IMdLoaderOptions =
  | IMdLoaderDefaultModeOptions
  | IMdLoaderDemosModeOptions;

function getDemoSourceFiles(demos: IMdTransformerResult['meta']['demos'] = []) {
  return demos.reduce<string[]>((ret, demo) => {
    if ('sources' in demo) {
      ret.push(...Object.values(demo.sources));
    }

    return ret;
  }, []);
}

function emit(this: any, opts: IMdLoaderOptions, ret: IMdTransformerResult) {
  const { demos, embeds } = ret.meta;

  // declare embedded files as loader dependency, for re-compiling when file changed
  embeds!.forEach((file) => this.addDependency(file));

  // declare demo source files as loader dependency, for re-compiling when file changed
  getDemoSourceFiles(demos).forEach((file) => this.addDependency(file));

  if (opts.mode === 'meta') {
    const { frontmatter, toc, texts } = ret.meta;

    // apply demos resolve hook
    if (demos && opts.onResolveDemos) {
      opts.onResolveDemos(demos);
    }

    // apply atom meta resolve hook
    if (frontmatter!.atomId && opts.onResolveAtomMeta) {
      opts.onResolveAtomMeta(frontmatter!.atomId, frontmatter);
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
            // handle un-existed source file, e.g. custom tech-stack return custom dependencies
            if (!asset.dependencies[file]) return;

            // to avoid modify original asset object
            asset = lodash.cloneDeep(asset);
            asset.dependencies[
              file
            ].value = `{{{require('-!${sources[file]}?dumi-raw').default}}}`;
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

function getDepsCacheKey(deps: (typeof depsMapping)['0'] = []) {
  return JSON.stringify(
    deps.map(
      (file) => `${file}:${getContentHash(fs.readFileSync(file, 'utf-8'))}`,
    ),
  );
}

const deferrer: Record<string, Promise<IMdTransformerResult>> = {};
const depsMapping: Record<string, string[]> = {};

export default function mdLoader(this: any, content: string) {
  const opts: IMdLoaderOptions = this.getOptions();
  const cb = this.async();

  // disable cache for avoid assets metadata lost
  // because the onResolveDemos and onResolveAtomMeta hook does not be fired when cache hit
  if (
    process.env.NODE_ENV === 'production' &&
    ['onResolveDemos', 'onResolveAtomMeta'].some((k) => k in opts)
  ) {
    this.cacheable(false);
  }

  const cache = getCache('md-loader');
  // format: {path:contenthash:loaderOpts}
  const baseCacheKey = [
    this.resourcePath,
    getContentHash(content),
    JSON.stringify(lodash.omit(opts, ['mode', 'builtins', 'onResolveDemos'])),
  ].join(':');
  // format: {baseCacheKey:{deps:contenthash}[]}
  const cacheKey = [
    baseCacheKey,
    getDepsCacheKey(depsMapping[this.resourcePath]),
  ].join(':');
  const cacheRet = cache.getSync(cacheKey, '');

  if (cacheRet) {
    // file cache
    cb(null, emit.call(this, opts, cacheRet));
    return;
  } else if (cacheKey in deferrer) {
    // deferrer cache
    deferrer[cacheKey]
      .then((res) => {
        cb(null, emit.call(this, opts, res));
      })
      .catch(cb);
    return;
  }

  // share deferrer for same cache key
  deferrer[cacheKey] = transform(content, {
    ...(lodash.omit(opts, ['mode', 'builtins', 'onResolveDemos']) as Omit<
      IMdLoaderOptions,
      'mode' | 'builtins' | 'onResolveDemos'
    >),
    fileAbsPath: winPath(this.resourcePath),
  });

  deferrer[cacheKey]
    .then((ret) => {
      // update deps mapping
      depsMapping[this.resourcePath] = ret.meta.embeds!.concat(
        getDemoSourceFiles(ret.meta.demos),
      );

      // re-generate cache key with latest embeds & sources data
      const finalCacheKey = [
        baseCacheKey,
        getDepsCacheKey(depsMapping[this.resourcePath]),
      ].join(':');

      // save cache with final cache key
      cache.setSync(finalCacheKey, ret);
      cb(null, emit.call(this, opts, ret));
      delete deferrer[cacheKey];
    })
    .catch(cb);
}
