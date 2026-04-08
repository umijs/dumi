import type { IApi, IDumiTechStack } from '@/types';
import path from 'path';
import { shouldDisabledLiveDemo } from './utils';

const mdLoaderPath = require.resolve('../../loaders/markdown');

export const UTOOPACK_LOADER_CTX_KEY = '__dumiLoaderContextPath';

export const LOADER_CTX_FILENAME = 'dumi-loader-ctx.cjs';

function toSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function findInRequireCache(
  target: object,
): { modulePath: string; exportName: string } | null {
  for (const [filename, mod] of Object.entries(require.cache)) {
    if (!mod?.exports) continue;
    const exp = mod.exports;
    if (exp === target)
      return { modulePath: filename, exportName: 'module.exports' };
    if (exp?.default === target)
      return { modulePath: filename, exportName: 'default' };
    for (const [k, v] of Object.entries(exp as object)) {
      if (v === target) return { modulePath: filename, exportName: k };
    }
  }
  return null;
}

export function buildLoaderContextContent(
  techStacks: IDumiTechStack[],
  builtins: Record<string, { specifier: string; source: string }> = {},
): string {
  const refs: string[] = [];

  for (const ts of techStacks) {
    const ctor = ts.constructor;

    if (ctor !== Object) {
      // Class instance — find the constructor in the require cache
      const found = findInRequireCache(ctor);
      if (found) {
        const modRef = `require(${JSON.stringify(found.modulePath)})`;
        const ctorRef =
          found.exportName === 'module.exports'
            ? modRef
            : `(${modRef})[${JSON.stringify(found.exportName)}]`;
        refs.push(`new (${ctorRef})()`);
      }
    } else {
      // Plain object (defineTechStack) — find the object itself in the cache
      const found = findInRequireCache(ts);
      if (found) {
        const modRef = `require(${JSON.stringify(found.modulePath)})`;
        const ref =
          found.exportName === 'module.exports'
            ? modRef
            : `(${modRef})[${JSON.stringify(found.exportName)}]`;
        refs.push(ref);
      }
    }
  }

  return (
    `'use strict';\n` +
    `exports.techStacks = [${refs.join(', ')}];\n` +
    `exports.builtins = ${JSON.stringify(builtins)};\n`
  );
}

export const getUtoopackRules = (api: IApi): Record<string, unknown> => {
  const disableLiveDemo = shouldDisabledLiveDemo(api);

  const loaderContextPath = path.join(
    api.paths.absTmpPath,
    LOADER_CTX_FILENAME,
  );

  const cfgResolve = (api.config as any).resolve ?? {};
  const serializableBaseOpts = toSerializable({
    cwd: api.cwd,
    alias: api.config.alias || {},
    resolve: {
      atomDirs: cfgResolve.atomDirs ?? [{ type: 'component', dir: 'src' }],
      docDirs: cfgResolve.docDirs ?? ['docs'],
      codeBlockMode: cfgResolve.codeBlockMode ?? 'active',
      forceKebabCaseRouting: cfgResolve.forceKebabCaseRouting ?? true,
      ...(cfgResolve.entryFile ? { entryFile: cfgResolve.entryFile } : {}),
    },
    routes: api.appData.routes || {},
    builtins: {},
    locales: api.config.locales || [],
    pkg: api.pkg,
    disableLiveDemo,
    [UTOOPACK_LOADER_CTX_KEY]: loaderContextPath,
  });

  return {
    // handle ?watch=parent virtual module: return empty content to establish file-watching dependency
    '**/*': [
      {
        condition: { query: /^\?watch=parent$/ },
        loaders: [require.resolve('../../loaders/null')],
        as: '*.js',
      },
      // handle raw content for demo source display (?dumi-raw)
      {
        condition: { query: /^\?dumi-raw$/ },
        loaders: [
          require.resolve('../../loaders/post-raw'),
          require.resolve('raw-loader'),
          require.resolve('../../loaders/pre-raw'),
        ],
        as: '*.js',
      },
      // handle external demo component files (?techStack=xxx)
      // techStacks are NOT serializable; pass loaderContextPath and hydrate in the loader
      {
        condition: { query: /^\?techStack=.*$/ },
        loaders: [
          {
            loader: require.resolve('../../loaders/demo'),
            options: toSerializable({
              cwd: api.cwd,
              [UTOOPACK_LOADER_CTX_KEY]: loaderContextPath,
            }),
          },
        ],
        as: '*.js',
      },
    ],

    // extract frontmatter/toc metadata from JS/TS page components (?type=frontmatter)
    // NOTE:
    // - Markdown ?type=frontmatter is already handled by the '*.md' rule below.
    // - After the md loader outputs JS, utoopack will expose that virtual module as
    //   '*.md.js?type=frontmatter'. Without the extra path guard here, this JS rule
    //   runs again and page-loader overwrites markdown frontmatter with filename-based
    //   fallbacks like "Docs" / "C Md".
    // - Excluding '*.md.js' keeps the markdown frontmatter result intact while still
    //   allowing real JS/TS page components to use page-loader.
    '*.{js,jsx,ts,tsx}': {
      condition: {
        all: [
          { query: /^\?type=frontmatter$/ },
          { not: { path: /\.md\.js$/ } },
        ],
      },
      loaders: [require.resolve('../../loaders/page')],
      as: '*.js',
    },

    // handle markdown files with different modes based on query type
    '*.md': [
      {
        condition: { query: /^\?type=frontmatter$/ },
        loaders: [
          {
            loader: mdLoaderPath,
            options: { ...serializableBaseOpts, mode: 'frontmatter' },
          },
        ],
        as: '*.js',
      },
      // extract plain text for full-text search
      {
        condition: { query: /^\?type=text$/ },
        loaders: [
          {
            loader: mdLoaderPath,
            options: { ...serializableBaseOpts, mode: 'text' },
          },
        ],
        as: '*.js',
      },
      // extract demo index metadata from markdown
      {
        condition: { query: /^\?type=demo-index$/ },
        loaders: [
          {
            loader: mdLoaderPath,
            options: { ...serializableBaseOpts, mode: 'demo-index' },
          },
        ],
        as: '*.js',
      },
      // compile inline demo code blocks
      {
        condition: { query: /^\?type=demo$/ },
        loaders: [
          {
            loader: mdLoaderPath,
            options: { ...serializableBaseOpts, mode: 'demo' },
          },
        ],
        as: '*.js',
      },
      // default: transform markdown into a React page component
      {
        loaders: [
          {
            loader: mdLoaderPath,
            options: serializableBaseOpts,
          },
        ],
        as: '*.js',
      },
    ],
  };
};
