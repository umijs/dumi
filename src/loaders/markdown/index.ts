import {
  UTOOPACK_LOADER_CTX_KEY,
  getUtoopackMdCacheNamespace,
} from '@/features/compile/utoopackLoaders';
import { isTabRouteFile } from '@/features/tabs';
import type { IThemeLoadResult } from '@/features/theme/loader';
import { generateMetaChunkName, getCache, getContentHash } from '@/utils';
import fs from 'fs';
import path from 'path';
import { Mustache, lodash, winPath } from 'umi/plugin-utils';
import {
  getDemoOverlayResourceQuery,
  getDemoResourceQuery,
  isDemoOverlayQuery,
} from './demoQuery';
import { getOrCreateWithFileLock } from './sharedCache';
import transform, {
  type IMdTransformerOptions,
  type IMdTransformerResult,
} from './transformer';
import { CONTENT_TEXTS_OBJ_NAME } from './transformer/rehypeText';

interface IMdLoaderDefaultModeOptions
  extends Omit<IMdTransformerOptions, 'fileAbsPath'> {
  mode?: 'markdown';
  cacheDirectory?: string;
  cacheEpoch?: string;
  builtins: IThemeLoadResult['builtins'];
  onResolveDemos?: (
    demos: NonNullable<IMdTransformerResult['meta']['demos']>,
  ) => void;
  onResolveAtomMeta?: (
    atomId: string,
    meta: IMdTransformerResult['meta']['frontmatter'],
  ) => void;
  demoAssetsFile?: string;
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

type MdLoaderCache = {
  getSync: (key: string, defaultValue: any) => any;
};

type MdTransformCacheRecord = {
  version: 2;
  deps: string[];
  depsKey: string;
  result: IMdTransformerResult;
};

type MdTransformDepsHint = {
  version: 1;
  deps: string[];
};

type ReadDependency = (file: string) => Promise<string>;

const MD_LOADER_RUNTIME_OPTION_KEYS = [
  'mode',
  'builtins',
  'onResolveDemos',
  'onResolveAtomMeta',
  'demoAssetsFile',
  'cacheDirectory',
  'cacheEpoch',
] as const;

export function getMdTransformCacheKeys({
  resourcePath,
  content,
  useUtoopackDemoHMR,
  demoOverlay,
  opts,
}: {
  resourcePath: string;
  content: string;
  useUtoopackDemoHMR: boolean;
  demoOverlay?: boolean;
  opts: IMdLoaderOptions;
}) {
  const depsHintKey = [
    resourcePath,
    useUtoopackDemoHMR,
    demoOverlay ? 'demo-overlay' : 'all-demos',
    JSON.stringify(lodash.omit(opts, MD_LOADER_RUNTIME_OPTION_KEYS)),
  ].join(':');

  return {
    depsHintKey,
    baseCacheKey: [depsHintKey, getContentHash(content)].join(':'),
  };
}

function getStatRevision(stat: fs.BigIntStats) {
  return [stat.dev, stat.ino, stat.mode, stat.size, stat.mtimeNs, stat.ctimeNs]
    .map(String)
    .join(':');
}

async function getFileRevision(file: string) {
  return getStatRevision(await fs.promises.stat(file, { bigint: true }));
}

function isMissingFsError(err: any) {
  return err?.code === 'ENOENT' || err?.code === 'ENOTDIR';
}

async function getMissingParentRevision(file: string) {
  let current = file;

  while (true) {
    try {
      const revision = getStatRevision(
        await fs.promises.stat(current, { bigint: true }),
      );

      // The loader filesystem reported a missing target which appeared before
      // the physical snapshot completed. Keep that race distinct from a
      // genuinely missing path so it cannot validate an older cache record.
      return `${path.normalize(current)}:${
        current === file ? '<appeared>:' : ''
      }${revision}`;
    } catch (err: any) {
      if (!isMissingFsError(err)) throw err;

      const parent = path.dirname(current);
      if (parent === current) return `${current}:<missing>`;

      current = parent;
    }
  }
}

function isMalformedCacheError(err: unknown) {
  return (
    err instanceof SyntaxError ||
    (err instanceof Error &&
      /Unexpected end of JSON input|Unterminated string in JSON/.test(
        err.message,
      ))
  );
}

export function getMdLoaderCacheSync<T>(
  cache: MdLoaderCache,
  key: string,
  defaultValue: T,
): T {
  try {
    return cache.getSync(key, defaultValue);
  } catch (err) {
    if (isMalformedCacheError(err)) return defaultValue;

    throw err;
  }
}

function getDemoSidecarFile(file: string) {
  const { dir, name } = path.parse(file);

  return path.join(dir, `${name}.md`);
}

function collectDemoSourceFiles(
  demos: IMdTransformerResult['meta']['demos'] = [],
  includeMissingSidecars = false,
) {
  const files = new Set<string>();

  demos.forEach((demo) => {
    if ('resolveMap' in demo) {
      Object.values(demo.resolveMap)
        .filter((p) => path.isAbsolute(p))
        .forEach((file) => {
          files.add(file);
          const sidecarFile = getDemoSidecarFile(file);

          if (includeMissingSidecars || fs.existsSync(sidecarFile)) {
            files.add(sidecarFile);
          }
        });
    }
  });

  return Array.from(files);
}

export function getDemoSourceFiles(
  demos: IMdTransformerResult['meta']['demos'] = [],
) {
  return collectDemoSourceFiles(demos);
}

function getDemoCacheFiles(demos: IMdTransformerResult['meta']['demos'] = []) {
  return collectDemoSourceFiles(demos, true);
}

export function getDemoWatchFiles(
  opts: IMdLoaderOptions,
  demos: IMdTransformerResult['meta']['demos'] = [],
  resourceQuery = '',
) {
  if (opts.mode === 'demo-index') return [];

  const useScopedDemoHMR =
    opts.useUtoopackDemoHMR === true &&
    UTOOPACK_LOADER_CTX_KEY in (opts as IMdLoaderOptions & Record<string, any>);
  const demoOverlay =
    useScopedDemoHMR && opts.mode === 'demo'
      ? isDemoOverlayQuery(resourceQuery)
      : false;

  if (!useScopedDemoHMR || demoOverlay) {
    return getDemoCacheFiles(demos);
  }

  const files = new Set<string>();

  demos.forEach((demo) => {
    if (!('resolveMap' in demo)) return;

    const deferSidecar = Boolean(
      (
        demo as typeof demo & {
          __dumiUtoopackDeferredSidecar?: boolean;
        }
      ).__dumiUtoopackDeferredSidecar,
    );

    Object.values(demo.resolveMap)
      .filter((file) => path.isAbsolute(file))
      .forEach((file) => {
        files.add(file);
        if (!deferSidecar) files.add(getDemoSidecarFile(file));
      });
  });

  return Array.from(files);
}

export function addDemoFileDependency(
  loaderContext: {
    addDependency: (file: string) => void;
    addMissingDependency?: (file: string) => void;
  },
  opts: IMdLoaderOptions,
  file: string,
) {
  // @utoo/pack currently forwards fileDependencies, but not
  // missingDependencies, to its native watcher. Register missing sidecars as
  // regular file dependencies there so creating one still invalidates the
  // markdown transform.
  if (
    fs.existsSync(file) ||
    UTOOPACK_LOADER_CTX_KEY in (opts as IMdLoaderOptions & Record<string, any>)
  ) {
    loaderContext.addDependency(file);
  } else if (loaderContext.addMissingDependency) {
    loaderContext.addMissingDependency(file);
  } else {
    loaderContext.addDependency(file);
  }
}

export function addMdResultDependencies(
  loaderContext: {
    addDependency: (file: string) => void;
    addMissingDependency?: (file: string) => void;
  },
  opts: IMdLoaderOptions,
  ret: IMdTransformerResult,
  resourceQuery = '',
) {
  ret.meta.embeds?.forEach((file) => loaderContext.addDependency(file));
  getDemoWatchFiles(opts, ret.meta.demos, resourceQuery).forEach((file) =>
    addDemoFileDependency(loaderContext, opts, file),
  );
}

function isRelativePath(path: string) {
  return /^\.{1,2}(?!\w)/.test(path);
}

function normalizeRouteFile(file: string) {
  return winPath(file).replace(/\.(mdx?)\.js$/, '.$1');
}

function getRouteId(opts: IMdLoaderOptions, fileAbsPath: string) {
  const normalizedFile = normalizeRouteFile(fileAbsPath);
  const route = Object.values(opts.routes ?? {}).find((item) => {
    const routeFile = (item as any).file || (item as any).__absFile;

    return routeFile && normalizeRouteFile(routeFile) === normalizedFile;
  });

  return (route as any)?.id as string | undefined;
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

  if (demos && opts.demoAssetsFile) {
    const assets = demos.reduce<string[]>((acc, demo) => {
      if ('asset' in demo) acc.push(JSON.stringify(demo.asset));
      return acc;
    }, []);

    if (assets.length) {
      fs.mkdirSync(path.dirname(opts.demoAssetsFile), { recursive: true });
      fs.appendFileSync(opts.demoAssetsFile, `${assets.join('\n')}\n`);
    }
  }

  // apply atom meta resolve hook
  if (frontmatter!.atomId && opts.onResolveAtomMeta) {
    opts.onResolveAtomMeta(frontmatter!.atomId, frontmatter);
  }
  // Use ret.meta.embeds directly instead of this.getDependencies().slice(1):
  // - In webpack, getDependencies() returns [resourcePath, ...addDependency() files]
  //   so slice(1) gets the embedded files.
  // - In utoopack (turbopack), getDependencies() may return [] or only explicitly
  //   added items without the resource, making slice(1) unreliable.
  // ret.meta.embeds is the canonical list of embedded markdown files from the
  // transformer, so use it directly.
  const embeddedMdFiles = (ret.meta.embeds ?? []).filter(
    (filePath: string) =>
      filePath.endsWith('.md') && !filePath.includes('node_modules'),
  );
  // import all builtin components, may be used by markdown content
  return `${Object.values(opts.builtins)
    .map((item) => `import ${item.specifier} from '${winPath(item.source)}';`)
    .join('\n')}
${embeddedMdFiles
  .map(
    (md: string) => `
import '${winPath(md)}?watch=parent';
`,
  )
  .join('\n')}
import LoadingComponent from '@@/dumi/theme/loading';
import React, { Suspense } from 'react';
import { DumiPage } from 'dumi';
${
  opts.useUtoopackDemoHMR
    ? "import { mergeDemoModules } from 'dumi/dist/client/theme-api/DumiDemo/hmr';"
    : ''
}
import { texts as ${CONTENT_TEXTS_OBJ_NAME} } from '${winPath(
    this.resourcePath,
  )}?type=text';

// export named function for fastRefresh
// ref: https://github.com/pmmmwh/react-refresh-webpack-plugin/blob/main/docs/TROUBLESHOOTING.md#edits-always-lead-to-full-reload
function DumiMarkdownContent() {
  return (
    <${wrapper}>
      <Suspense fallback={<LoadingComponent />}>
        ${ret.content}
      </Suspense>
    </${wrapper}>
  )
}

export default DumiMarkdownContent;`;
}

export function emitDemo(
  this: any,
  opts: IMdLoaderDemoModeOptions,
  ret: IMdTransformerResult,
) {
  const demoOverlay =
    opts.useUtoopackDemoHMR && UTOOPACK_LOADER_CTX_KEY in (opts as any)
      ? isDemoOverlayQuery(this.resourceQuery)
      : false;
  const demos = ret.meta.demos;
  const demoHMRVersions = Object.fromEntries(
    (demos ?? []).flatMap((demo) => {
      const hmrVersion = (
        demo as typeof demo & { __dumiUtoopackHMRVersion?: string }
      ).__dumiUtoopackHMRVersion;

      return typeof hmrVersion === 'string'
        ? [[demo.id, hmrVersion] as const]
        : [];
    }),
  );
  const isUtoopackContext = UTOOPACK_LOADER_CTX_KEY in (opts as any);
  const isRuntimeFullyVersioned = (demos ?? []).every(
    (demo) =>
      !('asset' in demo) ||
      typeof (demo as typeof demo & { __dumiUtoopackHMRVersion?: string })
        .__dumiUtoopackHMRVersion === 'string',
  );
  const enableDemoHMR =
    opts.useUtoopackDemoHMR === true &&
    Object.keys(demoHMRVersions).length > 0 &&
    (!isUtoopackContext || demoOverlay || isRuntimeFullyVersioned);
  const demoHMRChannel =
    isUtoopackContext && !demoOverlay ? 'runtime' : undefined;
  const demoHMRModuleId = JSON.stringify(
    winPath(
      `${this.resourcePath}${
        isUtoopackContext
          ? getDemoOverlayResourceQuery()
          : getDemoResourceQuery()
      }`,
    ),
  );
  const enableUtoopackSelfAccept = enableDemoHMR && isUtoopackContext;

  if (demoOverlay) {
    const overlayDemos = Object.fromEntries(
      (demos ?? []).map((demo) => {
        const previewerProps =
          'previewerProps' in demo ? demo.previewerProps : undefined;
        const ownedPreviewerProps =
          (
            demo as typeof demo & {
              __dumiUtoopackDeferredPreviewerProps?: string[];
            }
          ).__dumiUtoopackDeferredPreviewerProps ?? [];
        const assetPatch =
          'asset' in demo
            ? lodash.pick(demo.asset, [
                'description',
                'keywords',
                'snapshot',
                'title',
              ])
            : undefined;

        return [
          demo.id,
          {
            ...(assetPatch ? { asset: assetPatch } : {}),
            previewerProps: previewerProps ?? {},
            __dumiOwnedPreviewerProps: ownedPreviewerProps,
          },
        ];
      }),
    );
    const output = [
      `import '${winPath(this.resourcePath)}?watch=parent';`,
      enableDemoHMR
        ? "import { registerDemoHMRModule } from 'dumi/dist/client/theme-api/DumiDemo/hmr';"
        : '',
      `export const demos = ${JSON.stringify(overlayDemos)};`,
      enableUtoopackSelfAccept
        ? `if (
  typeof __turbopack_context__ !== 'undefined' &&
  typeof __turbopack_context__.m?.hot?.accept === 'function'
) {
  __turbopack_context__.m.hot.accept();
}`
        : '',
      enableDemoHMR
        ? `registerDemoHMRModule(${demoHMRModuleId}, ${JSON.stringify(
            demoHMRVersions,
          )}${demoHMRChannel ? `, ${JSON.stringify(demoHMRChannel)}` : ''});`
        : '',
    ];

    return output.filter(Boolean).join('\n');
  }

  const renderedDemos = demos?.map((demo) => ({
    ...demo,
    renderedPreviewerProps:
      'previewerProps' in demo && demo.previewerProps
        ? JSON.stringify(demo.previewerProps)
        : undefined,
  }));
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
            .filter((item): item is IDemoDependency => item !== undefined),
        );
      }, []);
  const routeId = getRouteId(opts, this.resourcePath);

  return Mustache.render(
    `import React from 'react';
import '${winPath(this.resourcePath)}?watch=parent';
{{#enableDemoHMR}}
import { registerDemoHMRModule } from 'dumi/dist/client/theme-api/DumiDemo/hmr';
{{/enableDemoHMR}}
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
    {{#routeId}}
    routeId: '{{{routeId}}}',
    {{/routeId}}
    context: {{{renderContext}}},
    {{#previewerProps}}
    previewerProps: {{{renderedPreviewerProps}}},
    {{/previewerProps}}
    renderOpts: {{{renderRenderOpts}}},
  },
  {{/demos}}
};{{#enableUtoopackSelfAccept}}
if (
  typeof __turbopack_context__ !== 'undefined' &&
  typeof __turbopack_context__.m?.hot?.accept === 'function'
) {
  __turbopack_context__.m.hot.accept();
}
{{/enableUtoopackSelfAccept}}{{#enableDemoHMR}}
  registerDemoHMRModule({{{demoHMRModuleId}}}, {{{demoHMRVersions}}}{{#demoHMRChannel}}, {{{demoHMRChannel}}}{{/demoHMRChannel}});
{{/enableDemoHMR}}`,
    {
      demos: renderedDemos,
      dedupedDemosDeps,
      demoHMRModuleId,
      demoHMRChannel: demoHMRChannel
        ? JSON.stringify(demoHMRChannel)
        : undefined,
      demoHMRVersions: JSON.stringify(demoHMRVersions),
      enableDemoHMR,
      enableUtoopackSelfAccept,
      routeId,
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
            // mako and utoopack (turbopack) do not support webpack's -! inline loader syntax
            if (process.env.OKAM || (opts as any)[UTOOPACK_LOADER_CTX_KEY]) {
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

export function renderDemoIndex(
  resourcePath: string,
  opts: Pick<
    IMdLoaderDemoIndexModeOptions,
    'cwd' | 'locales' | 'useUtoopackDemoHMR'
  > &
    Record<string, any>,
  demos: IMdTransformerResult['meta']['demos'],
) {
  const useScopedDemoHMR =
    opts.useUtoopackDemoHMR === true && UTOOPACK_LOADER_CTX_KEY in opts;

  if (useScopedDemoHMR) {
    const runtimeRequest = winPath(`${resourcePath}${getDemoResourceQuery()}`);
    const overlayRequest = winPath(
      `${resourcePath}${getDemoOverlayResourceQuery()}`,
    );

    return `
import { mergeDemoModules } from 'dumi/dist/client/theme-api/DumiDemo/hmr';
const demoRuntimeGetter = () => import(${JSON.stringify(runtimeRequest)});
const demoOverlayGetter = () => import(${JSON.stringify(overlayRequest)});
const demoGetter = () =>
  Promise.all([demoRuntimeGetter(), demoOverlayGetter()]).then(
    ([runtime, overlay]) => mergeDemoModules(runtime, overlay),
  );
const demoGetters = Object.fromEntries(
  ${JSON.stringify(
    demos?.map((demo) => demo.id),
  )}.map((id) => [id, demoGetter]),
);
export const demoIndex = {
  ids: ${JSON.stringify(demos?.map((demo) => demo.id))},
  getters: demoGetters,
  getter: demoGetter,
};`;
  }

  return Mustache.render(
    `
export const demoIndex = {
  ids: {{{ids}}},
  getter: {{{getter}}}
};`,
    {
      ids: JSON.stringify(demos?.map((demo) => demo.id)),
      getter: `() => import(/* webpackChunkName: "${generateMetaChunkName(
        resourcePath,
        opts.cwd,
        opts.locales.map(({ id }) => id),
      )}" */'${winPath(resourcePath)}?type=demo')`,
    },
  );
}

function emitDemoIndex(
  this: any,
  opts: IMdLoaderDemoIndexModeOptions,
  ret: IMdTransformerResult,
) {
  const { demos } = ret.meta;

  return `import '${winPath(this.resourcePath)}?watch=parent';
${renderDemoIndex(this.resourcePath, opts, demos)}`;
}

export function emitFrontmatter(
  this: any,
  opts: IMdLoaderFrontmatterModeOptions,
  ret: IMdTransformerResult,
) {
  const { frontmatter, toc, demos } = ret.meta;
  const resourcePath = winPath(this.resourcePath);
  const isUtoopack = UTOOPACK_LOADER_CTX_KEY in (opts as any);
  const useScopedDemoHMR = isUtoopack && opts.useUtoopackDemoHMR === true;

  if (useScopedDemoHMR) {
    const rendered = Mustache.render(
      `import '${resourcePath}?watch=parent';
globalThis.__DUMI_FM__ = globalThis.__DUMI_FM__ || {};
globalThis.__DUMI_TOC__ = globalThis.__DUMI_TOC__ || {};
globalThis.__DUMI_FM__['${resourcePath}'] = {{{frontmatter}}};
globalThis.__DUMI_TOC__['${resourcePath}'] = {{{toc}}};
export const frontmatter = globalThis.__DUMI_FM__['${resourcePath}'];
export const toc = globalThis.__DUMI_TOC__['${resourcePath}'];`,
      {
        toc: JSON.stringify(toc),
        frontmatter: JSON.stringify(frontmatter),
      },
    );
    return rendered;
  }

  const demoIndex = renderDemoIndex(this.resourcePath, opts, demos);

  return Mustache.render(
    `import '${resourcePath}?watch=parent';
export const toc = new Proxy({{{toc}}}, {});
export const frontmatter = new Proxy({{{frontmatter}}}, {});
{{{demoIndex}}}`,
    {
      toc: JSON.stringify(toc),
      frontmatter: JSON.stringify(frontmatter),
      demoIndex,
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
  import '${winPath(this.resourcePath)}?watch=parent';
  export const texts = {{{texts}}};
  `,
    {
      texts: JSON.stringify(texts),
    },
  );
}

function emit(this: any, opts: IMdLoaderOptions, ret: IMdTransformerResult) {
  addMdResultDependencies(this, opts, ret, this.resourceQuery);

  // to avoid compile watch=parent virtual module
  if (this.resourceQuery.includes('watch=parent')) return null;

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

function normalizeDeps(deps: string[] = []) {
  return Array.from(new Set(deps)).sort();
}

const readDependencyFromFs: ReadDependency = (file) =>
  fs.promises.readFile(file, 'utf-8');

export async function getDepsCacheKey(
  deps: string[] = [],
  readDependency: ReadDependency = readDependencyFromFs,
) {
  return JSON.stringify(
    await Promise.all(
      normalizeDeps(deps).map(async (file) => {
        try {
          const content = await readDependency(file);

          return `${file}:${getContentHash(content)}:${await getFileRevision(
            file,
          )}`;
        } catch (err: any) {
          if (isMissingFsError(err)) {
            return `${file}:<missing>:${await getMissingParentRevision(file)}`;
          }

          throw err;
        }
      }),
    ),
  );
}

function getMdLoaderCacheRecord(cache: MdLoaderCache, key: string) {
  const record = getMdLoaderCacheSync<MdTransformCacheRecord | undefined>(
    cache,
    key,
    undefined,
  );

  return record?.version === 2 ? record : undefined;
}

async function getValidMdLoaderCacheRecord(
  cache: MdLoaderCache,
  key: string,
  readDependency: ReadDependency = readDependencyFromFs,
) {
  const record = getMdLoaderCacheRecord(cache, key);

  if (!record) return undefined;

  if (record.depsKey === (await getDepsCacheKey(record.deps, readDependency))) {
    return record;
  }

  return undefined;
}

export async function getMdLoaderCacheResult(
  cache: MdLoaderCache,
  key: string,
  readDependency: ReadDependency = readDependencyFromFs,
): Promise<IMdTransformerResult | undefined> {
  return (await getValidMdLoaderCacheRecord(cache, key, readDependency))
    ?.result;
}

export async function createStableTransform({
  initialDeps,
  createValue,
  getDeps,
  readDependency = readDependencyFromFs,
  onDepsDiscovered,
  maxAttempts = 3,
}: {
  initialDeps?: string[];
  createValue: () => Promise<IMdTransformerResult>;
  getDeps: (result: IMdTransformerResult) => string[];
  readDependency?: ReadDependency;
  onDepsDiscovered?: (deps: string[]) => void;
  maxAttempts?: number;
}): Promise<MdTransformCacheRecord> {
  let expectedDeps = initialDeps && normalizeDeps(initialDeps);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const beforeKey = expectedDeps
      ? await getDepsCacheKey(expectedDeps, readDependency)
      : undefined;
    const result = await createValue();
    const deps = normalizeDeps(getDeps(result));
    const depsKey = await getDepsCacheKey(deps, readDependency);

    onDepsDiscovered?.(deps);

    if (
      expectedDeps &&
      JSON.stringify(expectedDeps) === JSON.stringify(deps) &&
      beforeKey === depsKey
    ) {
      return { version: 2, deps, depsKey, result };
    }

    expectedDeps = deps;
  }

  throw Object.assign(
    new Error('Markdown dependencies changed repeatedly while transforming'),
    { code: 'EDEPSUNSTABLE' },
  );
}

export function createDependencyReader(
  loaderContext: any,
  useUtoopack: boolean,
  mode?: IMdLoaderOptions['mode'],
) {
  void loaderContext;
  void useUtoopack;
  void mode;
  // Cache fingerprints must not create bundler dependency edges. Watch edges
  // are registered explicitly from the emitted mode's dependency plan.
  return readDependencyFromFs;
}

function getMdTransformDepsHint(cache: MdLoaderCache, key: string) {
  const hint = getMdLoaderCacheSync<MdTransformDepsHint | undefined>(
    cache,
    key,
    undefined,
  );

  return hint?.version === 1 ? normalizeDeps(hint.deps) : undefined;
}

const deferrer: Record<string, Promise<MdTransformCacheRecord>> = {};

export default function mdLoader(this: any, content: string) {
  let opts: IMdLoaderOptions = this.getOptions();
  const loaderContextPath: string | undefined = (opts as any)[
    UTOOPACK_LOADER_CTX_KEY
  ];
  const useUtoopackDemoHMR =
    opts.useUtoopackDemoHMR === true && Boolean(loaderContextPath);
  const demoOverlay =
    useUtoopackDemoHMR && opts.mode === 'demo'
      ? isDemoOverlayQuery(this.resourceQuery)
      : false;

  if (loaderContextPath) {
    const ctx = require(loaderContextPath) as {
      techStacks: any[];
      builtins?: Record<string, { specifier: string; source: string }>;
      routes?: IMdLoaderOptions['routes'];
      extraRemarkPlugins?: IMdLoaderOptions['extraRemarkPlugins'];
      extraRehypePlugins?: IMdLoaderOptions['extraRehypePlugins'];
      demoAssetsFile?: string;
    };
    if (!opts.techStacks?.length) {
      (opts as any).techStacks = ctx.techStacks;
    }
    // builtins are not available at modifyConfig time in utoopack mode
    // (themeData is only set in modifyAppData, which is later).
    // Read them from the CJS loader-ctx file written in onGenerateFiles.
    if (ctx.builtins && !Object.keys((opts as any).builtins ?? {}).length) {
      (opts as any).builtins = ctx.builtins;
    }
    // routes are also generated later than modifyConfig in utoopack mode.
    if (ctx.routes && !Object.keys((opts as any).routes ?? {}).length) {
      (opts as any).routes = ctx.routes;
    }
    if (ctx.extraRemarkPlugins && !(opts as any).extraRemarkPlugins?.length) {
      (opts as any).extraRemarkPlugins = ctx.extraRemarkPlugins;
    }
    if (ctx.extraRehypePlugins && !(opts as any).extraRehypePlugins?.length) {
      (opts as any).extraRehypePlugins = ctx.extraRehypePlugins;
    }
    if (ctx.demoAssetsFile && !(opts as any).demoAssetsFile) {
      (opts as any).demoAssetsFile = ctx.demoAssetsFile;
    }
  }

  const cb = this.async();

  // disable cache for avoid assets metadata lost
  // because the onResolveDemos and onResolveAtomMeta hook does not be fired when cache hit
  if (
    process.env.NODE_ENV === 'production' &&
    ['onResolveDemos', 'onResolveAtomMeta', 'demoAssetsFile'].some(
      (k) => k in opts,
    )
  ) {
    this.cacheable(false);
  }

  const cacheEpoch = opts.cacheEpoch;
  const cacheNamespace =
    useUtoopackDemoHMR && cacheEpoch
      ? getUtoopackMdCacheNamespace(cacheEpoch)
      : 'md-loader';
  const cache = getCache(cacheNamespace, opts.cacheDirectory);
  const depsHintCache = getCache('md-loader-deps', opts.cacheDirectory);
  const readDependency = createDependencyReader(
    this,
    useUtoopackDemoHMR,
    opts.mode,
  );
  // Dependency hints intentionally omit markdown content so a markdown edit
  // can reuse the previously discovered dependency set. The stable transform
  // loop verifies and refreshes that set before publishing a result.
  const { baseCacheKey, depsHintKey } = getMdTransformCacheKeys({
    resourcePath: this.resourcePath,
    content,
    useUtoopackDemoHMR,
    demoOverlay,
    opts,
  });

  const createTransform = async () => {
    const result = await transform(content, {
      ...(lodash.omit(opts, [
        'mode',
        'builtins',
        'onResolveDemos',
        'cacheDirectory',
        'cacheEpoch',
      ]) as Omit<
        IMdLoaderOptions,
        'mode' | 'builtins' | 'onResolveDemos' | 'cacheDirectory' | 'cacheEpoch'
      >),
      fileAbsPath: winPath(this.resourcePath),
      useUtoopackDemoHMR,
      demoOverlay,
    });

    // Establish explicit watch edges before the stable transform fingerprints
    // the files it discovered.
    addMdResultDependencies(this, opts, result, this.resourceQuery);
    return result;
  };
  const getTransformDeps = (ret: IMdTransformerResult) =>
    normalizeDeps(ret.meta.embeds!.concat(getDemoCacheFiles(ret.meta.demos)));
  const saveDepsHint = (deps: string[]) => {
    depsHintCache.setSync(depsHintKey, {
      version: 1,
      deps: normalizeDeps(deps),
    } satisfies MdTransformDepsHint);
  };
  const cacheWithPath = cache as typeof cache & {
    path?: (key: string) => string;
  };

  const getTransform = async () => {
    const cachedCandidate = getMdLoaderCacheRecord(cache, baseCacheKey);
    if (cachedCandidate) {
      addMdResultDependencies(
        this,
        opts,
        cachedCandidate.result,
        this.resourceQuery,
      );
    }
    const cached = await getValidMdLoaderCacheRecord(
      cache,
      baseCacheKey,
      readDependency,
    );

    if (cached) return cached;

    const initialDeps =
      getMdTransformDepsHint(depsHintCache, depsHintKey) ??
      getMdLoaderCacheRecord(cache, baseCacheKey)?.deps;
    const depsFingerprint = initialDeps
      ? await getDepsCacheKey(initialDeps, readDependency)
      : '<discover>';
    const deferrerKey = [cacheNamespace, baseCacheKey, depsFingerprint].join(
      ':',
    );

    if (deferrerKey in deferrer) return deferrer[deferrerKey];

    const createRecord = async () => {
      if (useUtoopackDemoHMR) {
        return createStableTransform({
          initialDeps,
          createValue: createTransform,
          getDeps: getTransformDeps,
          readDependency,
          onDepsDiscovered: saveDepsHint,
        });
      }

      const result = await createTransform();
      const deps = getTransformDeps(result);
      const record: MdTransformCacheRecord = {
        version: 2,
        deps,
        depsKey: await getDepsCacheKey(deps),
        result,
      };

      saveDepsHint(deps);
      return record;
    };
    const saveRecord = (record: MdTransformCacheRecord) => {
      cache.setSync(baseCacheKey, record);
      saveDepsHint(record.deps);
    };

    // Utoopack runs loaders in isolated workers. Keep the file lock scoped to
    // one dev session; other builders continue to use process-local sharing.
    const pending =
      useUtoopackDemoHMR && cacheWithPath.path
        ? getOrCreateWithFileLock({
            lockPath: `${cacheWithPath.path(`transform:${baseCacheKey}`)}.lock`,
            getValue: () =>
              getValidMdLoaderCacheRecord(cache, baseCacheKey, readDependency),
            createValue: createRecord,
            setValue: saveRecord,
          })
        : (async () => {
            const current = await getValidMdLoaderCacheRecord(
              cache,
              baseCacheKey,
              readDependency,
            );

            if (current) return current;

            const created = await createRecord();
            saveRecord(created);
            return created;
          })();

    deferrer[deferrerKey] = pending;

    try {
      return await pending;
    } finally {
      if (deferrer[deferrerKey] === pending) delete deferrer[deferrerKey];
    }
  };

  getTransform()
    .then((record) => {
      addMdResultDependencies(this, opts, record.result, this.resourceQuery);
      cb(null, emit.call(this, opts, record.result));
    })
    .catch(cb);
}
