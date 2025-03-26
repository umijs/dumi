import { isTabRouteFile } from '@/features/tabs';
import type { IThemeLoadResult } from '@/features/theme/loader';
import { generateMetaChunkName, getCache, getContentHash } from '@/utils';
import fs from 'fs';
import path from 'path';
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
  onResolveDemos?: (
    demos: NonNullable<IMdTransformerResult['meta']['demos']>,
  ) => void;
  onResolveAtomMeta?: (
    atomId: string,
    meta: IMdTransformerResult['meta']['frontmatter'],
  ) => void;
  disableLiveDemo: boolean;
}

interface IMdLoaderDemosModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'meta';
}

interface IMdLoaderDemoModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'demo';
}

interface IMdLoaderDemoIndexModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'demo-index';
}

interface IMdLoaderFrontmatterModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'frontmatter';
}

interface IMdLoaderTextModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'text';
}

export type IMdLoaderOptions =
  | IMdLoaderDefaultModeOptions
  | IMdLoaderDemosModeOptions
  | IMdLoaderDemoModeOptions
  | IMdLoaderFrontmatterModeOptions
  | IMdLoaderTextModeOptions
  | IMdLoaderDemoIndexModeOptions;

interface IDemoDependency {
  key: string;
  specifier: string;
}

function getDemoSourceFiles(demos: IMdTransformerResult['meta']['demos'] = []) {
  return demos.reduce<string[]>((ret, demo) => {
    if ('resolveMap' in demo) {
      ret.push(
        ...Object.values(demo.resolveMap).filter((p) => path.isAbsolute(p)),
      );
    }

    return ret;
  }, []);
}

function isRelativePath(path: string) {
  return /^\.{1,2}(?!\w)/.test(path);
}

function emitDefault(
  this: any,
  opts: IMdLoaderDefaultModeOptions,
  ret: IMdTransformerResult,
) {
  const { frontmatter, demos } = ret.meta;
  const isTabContent = isTabRouteFile(this.resourcePath);
  // do not wrap DumiPage for tab content
  const wrapper = isTabContent ? '' : 'DumiPage';

  // apply demos resolve hook
  if (demos && opts.onResolveDemos) {
    opts.onResolveDemos(demos);
  }

  // apply atom meta resolve hook
  if (frontmatter!.atomId && opts.onResolveAtomMeta) {
    opts.onResolveAtomMeta(frontmatter!.atomId, frontmatter);
  }
  const dependencies = this.getDependencies()
    .slice(1)
    .filter((filePath: string) => {
      return !filePath.includes('node_modules');
    });
  // import all builtin components, may be used by markdown content
  return `${Object.values(opts.builtins)
    .map((item) => `import ${item.specifier} from '${winPath(item.source)}';`)
    .join('\n')}
${dependencies
  .filter((dep: string) => dep.endsWith('.md'))
  .map(
    (md: string) => `
import '${winPath(md)}?watch=parent';
`,
  )
  .join('\n')}
import LoadingComponent from '@@/dumi/theme/loading';
import React, { Suspense } from 'react';
import { DumiPage, useTabMeta, useRouteMeta } from 'dumi';

function DumiMarkdownInner() {
  const { texts: ${CONTENT_TEXTS_OBJ_NAME} } = use${
    isTabContent ? 'TabMeta' : 'RouteMeta'
  }();

  return ${ret.content};
}

// export named function for fastRefresh
// ref: https://github.com/pmmmwh/react-refresh-webpack-plugin/blob/main/docs/TROUBLESHOOTING.md#edits-always-lead-to-full-reload
function DumiMarkdownContent() {
  // wrap suspense for catch async meta data
  return <${wrapper}><Suspense fallback={<LoadingComponent />}><DumiMarkdownInner /></Suspense></${wrapper}>;
}

export default DumiMarkdownContent;`;
}

function emitDemo(
  this: any,
  opts: IMdLoaderDemoModeOptions,
  ret: IMdTransformerResult,
) {
  const { demos } = ret.meta;
  const shareDepsMap: Record<string, string> = {};
  const demoDepsMap: Record<string, Record<string, string>> = {};
  const relativeDepsMap: Record<string, Record<string, string>> = {};

  demos?.forEach((demo) => {
    if ('resolveMap' in demo && 'asset' in demo) {
      const entryFileName = Object.keys(demo.asset.dependencies)[0];
      demoDepsMap[demo.id] ??= {};
      relativeDepsMap[demo.id] ??= {};
      Object.keys(demo.resolveMap).forEach((key, index) => {
        const specifier = `${demo.id.replace(/[^\w\d]/g, '_')}_deps_${index}`;
        if (key !== entryFileName) {
          const isRelative = isRelativePath(key);
          const normalizedKey = isRelative
            ? winPath(demo.resolveMap[key])
            : key;

          if (!shareDepsMap[normalizedKey]) {
            demoDepsMap[demo.id][normalizedKey] = specifier;
            shareDepsMap[normalizedKey] = specifier;
          } else {
            demoDepsMap[demo.id][normalizedKey] = shareDepsMap[normalizedKey];
          }

          if (isRelative) {
            relativeDepsMap[demo.id][key] = `{{{${
              shareDepsMap[normalizedKey] || specifier
            }}}}`;
          }
        }
      });
    }
  });

  const dedupedDemosDeps = opts.disableLiveDemo
    ? []
    : Object.entries(demoDepsMap).reduce<IDemoDependency[]>((acc, [, deps]) => {
        return acc.concat(
          Object.entries(deps)
            .map(([key, specifier]) => {
              const existingIndex = acc.findIndex((obj) => obj.key === key);
              if (existingIndex === -1) {
                return { key, specifier };
              }
              return undefined;
            })
            .filter((item) => item !== undefined),
        );
      }, []);
  return Mustache.render(
    `import React from 'react';
import '${winPath(this.getDependencies()[0])}?watch=parent';
{{#dedupedDemosDeps}}
import * as {{{specifier}}} from '{{{key}}}';
{{/dedupedDemosDeps}}
export const demos = {
  {{#demos}}
  '{{{id}}}': {
    {{#component}}
    component: {{{component}}},
    {{/component}}
    asset: {{{renderAsset}}},
    context: {{{renderContext}}},
    renderOpts: {{{renderRenderOpts}}},
  },
  {{/demos}}
};`,
    {
      demos,
      dedupedDemosDeps,
      renderAsset: function renderAsset(this: NonNullable<typeof demos>[0]) {
        // do not render asset for inline demo
        if (!('asset' in this)) return 'null';

        // render asset for normal demo
        let { asset } = this;
        const { resolveMap } = this;

        // use raw-loader to load all source files
        Object.keys(this.resolveMap).forEach((file: string) => {
          // skip un-existed source file, e.g. custom tech-stack return custom dependencies
          // skip non-file asset because resolveMap will contains all dependencies since 2.3.0
          if (asset.dependencies[file]?.type === 'FILE') {
            let assetValue = `{{{require('-!${resolveMap[file]}?dumi-raw').default}}}`;
            // mako not support -!
            if (process.env.OKAM) {
              assetValue = `{{{require('${resolveMap[file]}?dumi-raw').default}}}`;
            }
            // to avoid modify original asset object
            asset = lodash.cloneDeep(asset);
            asset.dependencies[file].value = assetValue;
          }
        });

        return JSON.stringify(asset, null, 2).replace(/"{{{|}}}"/g, '');
      },
      renderContext: function renderContext(
        this: NonNullable<typeof demos>[0],
      ) {
        // do not render context for inline demo && config babel-import-plugin project
        if (
          !('resolveMap' in this) ||
          !('asset' in this) ||
          opts.disableLiveDemo
        )
          return 'undefined';
        const context = Object.entries(demoDepsMap[this.id]).reduce(
          (acc, [key, specifier]) => ({
            ...acc,
            ...{ [key]: `{{{${specifier}}}}` },
          }),
          relativeDepsMap[this.id],
        );
        return JSON.stringify(context, null, 2).replace(/"{{{|}}}"/g, '');
      },
      renderRenderOpts: function renderRenderOpts(
        this: NonNullable<typeof demos>[0],
      ) {
        if (!('renderOpts' in this) || opts.disableLiveDemo) {
          return 'undefined';
        }
        const renderOpts = this.renderOpts;
        const propertyArray: string[] = [];

        if (renderOpts.compilePath) {
          propertyArray.push(`
          compile: async (...args) => {
            return (await import('${winPath(
              renderOpts.compilePath,
            )}')).default(...args);
          },`);
        }

        if (renderOpts.rendererPath) {
          propertyArray.push(`
            renderer: (await import('${winPath(
              renderOpts.rendererPath,
            )}')).default,`);
        }

        if (renderOpts.preflightPath) {
          propertyArray.push(`
            preflight: (await import('${winPath(
              renderOpts.preflightPath,
            )}')).default,`);
        }

        if (propertyArray.length === 0) return 'undefined';

        return `{
          ${propertyArray.join('\n')}
        }`;
      },
    },
  );
}

function emitDemoIndex(
  this: any,
  opts: IMdLoaderDemoIndexModeOptions,
  ret: IMdTransformerResult,
) {
  const { demos } = ret.meta;

  return Mustache.render(
    `
    import '${winPath(this.getDependencies()[0])}?watch=parent';
    export const demoIndex = {
  ids: {{{ids}}},
  getter: {{{getter}}}
};`,
    {
      ids: JSON.stringify(demos?.map((demo) => demo.id)),
      getter: `() => import(/* webpackChunkName: "${generateMetaChunkName(
        this.resourcePath,
        opts.cwd,
        opts.locales.map(({ id }) => id),
      )}" */'${winPath(this.resourcePath)}?type=demo')`,
    },
  );
}

function emitFrontmatter(
  this: any,
  opts: IMdLoaderFrontmatterModeOptions,
  ret: IMdTransformerResult,
) {
  const { frontmatter, toc } = ret.meta;

  return Mustache.render(
    `
    import '${winPath(this.getDependencies()[0])}?watch=parent';
    export const toc = {{{toc}}};
export const frontmatter = {{{frontmatter}}};`,
    {
      toc: JSON.stringify(toc),
      frontmatter: JSON.stringify(frontmatter),
    },
  );
}

function emitText(
  this: any,
  opts: IMdLoaderTextModeOptions,
  ret: IMdTransformerResult,
) {
  const { texts } = ret.meta;

  return Mustache.render(
    `
  import '${winPath(this.getDependencies()[0])}?watch=parent';
  export const texts = {{{texts}}};
  `,
    {
      texts: JSON.stringify(texts),
    },
  );
}

function emit(this: any, opts: IMdLoaderOptions, ret: IMdTransformerResult) {
  const { demos, embeds } = ret.meta;

  // declare embedded files as loader dependency, for re-compiling when file changed
  embeds!.forEach((file) => this.addDependency(file));

  // declare demo source files as loader dependency, for re-compiling when file changed
  getDemoSourceFiles(demos).forEach((file) => this.addDependency(file));

  switch (opts.mode) {
    case 'demo':
      return emitDemo.call(this, opts, ret);
    case 'demo-index':
      return emitDemoIndex.call(this, opts, ret);
    case 'frontmatter':
      return emitFrontmatter.call(this, opts, ret);
    case 'text':
      return emitText.call(this, opts, ret);
    default:
      return emitDefault.call(this, opts as IMdLoaderDefaultModeOptions, ret);
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

      // re-generate cache key with latest embeds & source data
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
