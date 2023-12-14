import { isTabRouteFile } from '@/features/tabs';
import type { IThemeLoadResult } from '@/features/theme/loader';
import { generateMetaChunkName, getCache, getContentHash } from '@/utils';
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
  onResolveDemos?: (
    demos: NonNullable<IMdTransformerResult['meta']['demos']>,
  ) => void;
  onResolveAtomMeta?: (
    atomId: string,
    meta: IMdTransformerResult['meta']['frontmatter'],
  ) => void;
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

interface IMdLoaderScopeModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'scope';
}

interface IMdLoaderScopeIndexModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'scope-index';
}

export type IMdLoaderOptions =
  | IMdLoaderDefaultModeOptions
  | IMdLoaderDemosModeOptions
  | IMdLoaderDemoModeOptions
  | IMdLoaderFrontmatterModeOptions
  | IMdLoaderTextModeOptions
  | IMdLoaderDemoIndexModeOptions
  | IMdLoaderScopeModeOptions
  | IMdLoaderScopeIndexModeOptions;

function getDemoSourceFiles(demos: IMdTransformerResult['meta']['demos'] = []) {
  return demos.reduce<string[]>((ret, demo) => {
    if ('sources' in demo) {
      ret.push(...Object.values(demo.sources));
    }

    return ret;
  }, []);
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

  // import all builtin components, may be used by markdown content
  return `${Object.values(opts.builtins)
    .map((item) => `import ${item.specifier} from '${item.source}';`)
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

  return Mustache.render(
    `import React from 'react';

export const demos = {
  {{#demos}}
  '{{{id}}}': {
    component: {{{component}}},
    asset: {{{renderAsset}}}
  },
  {{/demos}}
};`,
    {
      demos,
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
}

function emitDemoIndex(
  this: any,
  opts: IMdLoaderDemoIndexModeOptions,
  ret: IMdTransformerResult,
) {
  const { demos } = ret.meta;

  return Mustache.render(
    `export const demoIndex = {
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
  opts: IMdLoaderFrontmatterModeOptions,
  ret: IMdTransformerResult,
) {
  const { frontmatter, toc } = ret.meta;

  return Mustache.render(
    `export const toc = {{{toc}}};
export const frontmatter = {{{frontmatter}}};`,
    {
      toc: JSON.stringify(toc),
      frontmatter: JSON.stringify(frontmatter),
    },
  );
}

function emitText(opts: IMdLoaderTextModeOptions, ret: IMdTransformerResult) {
  const { texts } = ret.meta;

  return Mustache.render(`export const texts = {{{texts}}};`, {
    texts: JSON.stringify(texts),
  });
}

function emitScope(opts: IMdLoaderOptions, ret: IMdTransformerResult) {
  const { demos } = ret.meta;

  // ignore `import type` and `import 'xxx'`
  const importReg = /import(?!(\stype|\s'))[\s\S]*?from.*;/g;

  return Mustache.render(
    `{{#renderImport}}
{{{.}}}
{{/renderImport}}

export const scopes = {
{{#demos}}
  '{{{id}}}': { {{{renderScope}}} },
{{/demos}}
}`,
    {
      demos,
      renderImport: function renderImport() {
        // do not render asset for inline demo
        if (!demos) return [];

        // render scope for normal demo
        const imports: Record<string, string[]> = {};
        for (const demo of demos) {
          if ('asset' in demo) {
            const { asset } = demo;
            Object.entries(asset.dependencies).forEach(([filename, file]) => {
              if (filename.endsWith('.tsx')) {
                const fileImports =
                  file.value.match(importReg) ||
                  ([] as unknown as RegExpMatchArray);
                fileImports.forEach((item) => {
                  const scope = item
                    .replace(/import([\s\S]*?)from.*;/, '$1')
                    .trim();
                  const dep = item
                    .replace(/import[\s\S]*?from(.*);/, '$1')
                    .trim();

                  const namedReg = /.*\{([\s\S]*?)}/g;
                  const namedScope = namedReg.test(scope)
                    ? scope
                        .replace(namedReg, '$1')
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                    : [];

                  const defaultReg = /(?:(?![,{]).)*/;
                  const defaultScope = scope.match(defaultReg)?.[0].trim();

                  imports[dep] ??= [];
                  if (defaultScope) {
                    const defaultImport = `default as ${defaultScope}`;
                    if (!imports[dep].includes(defaultImport)) {
                      imports[dep].push(defaultImport);
                    }
                  }

                  if (namedScope.length) {
                    for (const item of namedScope) {
                      if (!imports[dep].includes(item)) {
                        imports[dep].push(item);
                      }
                    }
                  }
                });
              }
            });
          }
        }

        return Object.entries(imports)
          .map(([key, value]) => {
            return value.length
              ? `import { ${value.join(', ')} } from ${key};`
              : '';
          })
          .filter(Boolean);
      },
      renderScope: function renderScope(this: NonNullable<typeof demos>[0]) {
        // do not render asset for inline demo
        if (!('asset' in this)) return '';

        // render asset for normal demo
        const { asset } = this;
        const demoScopes: string[] = [];
        Object.entries(asset.dependencies).forEach(([filename, file]) => {
          if (filename.endsWith('.tsx')) {
            const imports =
              file.value.match(importReg) ||
              ([] as unknown as RegExpMatchArray);
            const scopes = imports.reduce<string[]>((acc, item) => {
              const scope = item
                .replace(/import([\s\S]*?)from.*;/, '$1')
                .trim();
              const scopeList = scope
                .replace(/[{}]/g, '')
                .trim()
                .replace(/,$/g, '')
                // A as B ==> B
                .replace(/\S+\sas\s(.*?)/g, '$1');
              return [...acc, scopeList];
            }, []);
            demoScopes.push(...scopes);
          }
        });
        return demoScopes.join(', ');
      },
    },
  );
}

function emitScopeIndex(
  this: any,
  opts: IMdLoaderScopeIndexModeOptions,
  ret: IMdTransformerResult,
) {
  const { demos } = ret.meta;

  return Mustache.render(
    `export const scopeIndex = {
{{#demos}}
  '{{{id}}}': {{{getter}}},
{{/demos}}
};`,
    {
      demos,
      getter: `() => import('${winPath(this.resourcePath)}?type=scope')`,
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
    case 'scope':
      return emitScope.call(this, opts, ret);
    case 'scope-index':
      return emitScopeIndex.call(this, opts, ret);
    default:
      return emitDefault.call(this, opts, ret);
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
