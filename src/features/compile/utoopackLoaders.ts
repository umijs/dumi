import type { IApi, IDumiTechStack } from '@/types';
import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { register } from '@umijs/utils';
import fs from 'fs';
import path from 'path';
import { shouldDisabledLiveDemo } from './utils';

const mdLoaderPath = require.resolve('../../loaders/markdown');
const utilsRegisterPath = require.resolve('@umijs/utils');
const esbuildImplementorPath = require.resolve(
  '@umijs/bundler-utils/compiled/esbuild',
);

export const UTOOPACK_LOADER_CTX_KEY = '__dumiLoaderContextPath';

export const LOADER_CTX_FILENAME = 'dumi-loader-ctx.cjs';

const LOCAL_THEME_PLUGIN_FILES = [
  '.dumi/theme/plugins/tech-stack.ts',
  '.dumi/theme/plugins/tech-stack.tsx',
  '.dumi/theme/plugins/tech-stack.js',
  '.dumi/theme/plugins/tech-stack.jsx',
  '.dumi/theme/plugin.ts',
  '.dumi/theme/plugin.tsx',
  '.dumi/theme/plugin.js',
  '.dumi/theme/plugin.jsx',
];

type UnifiedPluginConfig = NonNullable<IApi['config']['extraRemarkPlugins']>[0];
type UnifiedPluginFn = (...args: any[]) => any;
type FunctionRef = { name: string };

function toSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function getLoaderContextSourceFiles(cwd: string, files: string[] = []) {
  const ret = new Set(files);

  for (const file of LOCAL_THEME_PLUGIN_FILES) {
    const absPath = path.join(cwd, file);

    if (fs.existsSync(absPath)) {
      ret.add(absPath);
    }
  }

  return [...ret];
}

type RequireRef = { modulePath: string; exportName: string };
type TechStackPluginRef = RequireRef;

function findInRequireCache(target: object): RequireRef | null {
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

function normalizeFnSource(fn: FunctionRef) {
  return Function.prototype.toString.call(fn).replace(/\s+/g, ' ');
}

function isSameFunction(candidate: unknown, target: FunctionRef) {
  return (
    typeof candidate === 'function' &&
    candidate.name === target.name &&
    normalizeFnSource(candidate) === normalizeFnSource(target)
  );
}

function findInModuleExports(
  target: UnifiedPluginFn,
  mod: NodeJS.Module,
): RequireRef | null {
  const exp = mod.exports;
  if (!exp) return null;
  if (isSameFunction(exp, target)) {
    return { modulePath: mod.filename, exportName: 'module.exports' };
  }
  if (isSameFunction(exp?.default, target)) {
    return { modulePath: mod.filename, exportName: 'default' };
  }
  for (const [k, v] of Object.entries(exp as object)) {
    if (isSameFunction(v, target)) {
      return { modulePath: mod.filename, exportName: k };
    }
  }

  return null;
}

function findConstructorInModuleExports(
  target: FunctionRef,
  mod: NodeJS.Module,
): RequireRef | null {
  const exp = mod.exports;
  if (!exp) return null;
  if (isSameFunction(exp, target)) {
    return { modulePath: mod.filename, exportName: 'module.exports' };
  }
  if (isSameFunction(exp?.default, target)) {
    return { modulePath: mod.filename, exportName: 'default' };
  }
  for (const [k, v] of Object.entries(exp as object)) {
    if (isSameFunction(v, target)) {
      return { modulePath: mod.filename, exportName: k };
    }
  }

  return null;
}

function findInSourceFiles(
  target: UnifiedPluginFn,
  sourceFiles: string[],
): RequireRef | null {
  register.register({ implementor: esbuild });
  register.clearFiles();

  try {
    for (const file of sourceFiles) {
      try {
        require(file);
        const mod = require.cache[file];
        if (!mod?.exports) continue;

        const found = findInModuleExports(target, mod);
        if (found) return found;
      } catch {}
    }

    return null;
  } finally {
    for (const file of register.getFiles()) {
      delete require.cache[file];
    }
    for (const file of sourceFiles) {
      delete require.cache[file];
    }
    register.restore();
  }
}

function findConstructorInSourceFiles(
  target: FunctionRef,
  sourceFiles: string[],
): RequireRef | null {
  register.register({ implementor: esbuild });
  register.clearFiles();

  try {
    for (const file of sourceFiles) {
      try {
        require(file);
        const mod = require.cache[file];
        if (!mod?.exports) continue;

        const found = findConstructorInModuleExports(target, mod);
        if (found) return found;
      } catch {}
    }

    return null;
  } finally {
    for (const file of register.getFiles()) {
      delete require.cache[file];
    }
    for (const file of sourceFiles) {
      delete require.cache[file];
    }
    register.restore();
  }
}

function toRequireRef(found: RequireRef) {
  const modRef = `require(${JSON.stringify(found.modulePath)})`;

  return found.exportName === 'module.exports'
    ? modRef
    : `(${modRef})[${JSON.stringify(found.exportName)}]`;
}

function createTechStackMockApi(
  onRegister: (fn: () => IDumiTechStack) => void,
) {
  const api = {
    cwd: process.cwd(),
    config: {},
    userConfig: {},
    pkg: {},
    paths: {},
    service: {},
    registerTechStack: onRegister,
    register(opts: { key?: string; fn?: () => IDumiTechStack }) {
      if (opts?.key === 'registerTechStack' && typeof opts.fn === 'function') {
        onRegister(opts.fn);
      }
    },
  };

  return new Proxy(api, {
    get(target, key) {
      if (key in target) {
        return target[key as keyof typeof target];
      }

      return () => {};
    },
  }) as unknown as IApi;
}

function isSameTechStack(a: IDumiTechStack, b: IDumiTechStack) {
  return (
    a === b || (a.name === b.name && a.constructor.name === b.constructor.name)
  );
}

function collectTechStacksFromPlugin(plugin: unknown): IDumiTechStack[] {
  if (typeof plugin !== 'function') return [];

  const ret: IDumiTechStack[] = [];
  const api = createTechStackMockApi((fn) => {
    try {
      const techStack = fn();
      if (techStack) ret.push(techStack);
    } catch {}
  });

  try {
    plugin(api);
  } catch {}

  return ret;
}

function findTechStackPluginInModule(
  target: IDumiTechStack,
  mod: NodeJS.Module,
): TechStackPluginRef | null {
  const exp = mod.exports;
  if (!exp) return null;
  const candidates: Array<[string, unknown]> = [
    ['module.exports', exp],
    ['default', exp?.default],
    ...Object.entries(exp as object),
  ];

  for (const [exportName, plugin] of candidates) {
    const techStacks = collectTechStacksFromPlugin(plugin);

    if (techStacks.some((techStack) => isSameTechStack(techStack, target))) {
      return { modulePath: mod.filename, exportName };
    }
  }

  return null;
}

function findTechStackPluginInSourceFiles(
  target: IDumiTechStack,
  sourceFiles: string[],
): TechStackPluginRef | null {
  register.register({ implementor: esbuild });
  register.clearFiles();

  try {
    for (const file of sourceFiles) {
      try {
        require(file);
        const mod = require.cache[file];
        if (!mod?.exports) continue;

        const found = findTechStackPluginInModule(target, mod);
        if (found) return found;
      } catch {}
    }

    return null;
  } finally {
    for (const file of register.getFiles()) {
      delete require.cache[file];
    }
    for (const file of sourceFiles) {
      delete require.cache[file];
    }
    register.restore();
  }
}

function toTechStackRefs(
  techStacks: IDumiTechStack[],
  sourceFiles: string[] = [],
) {
  const refs: string[] = [];

  for (const ts of techStacks) {
    const ctor = ts.constructor;
    let ref: string | undefined;

    if (ctor !== Object) {
      // Class instance — find the constructor in the require cache
      const found =
        findInRequireCache(ctor) ??
        findConstructorInSourceFiles(ctor, sourceFiles);
      if (found) {
        ref = `new (${toRequireRef(found)})()`;
      }
    } else {
      // Plain object (defineTechStack) — find the object itself in the cache
      const found = findInRequireCache(ts);
      if (found) {
        ref = toRequireRef(found);
      }
    }

    if (!ref) {
      const found = findTechStackPluginInSourceFiles(ts, sourceFiles);
      if (found) {
        ref = `...loadTechStacksFromPlugin(${toRequireRef(found)})`;
      }
    }

    if (ref) {
      refs.push(ref);
    } else {
      const name = ts.constructor.name ? ` (${ts.constructor.name})` : '';

      console.warn(
        `[dumi] Utoopack markdown loader cannot serialize tech stack "${ts.name}"${name}. ` +
          `Please export the tech stack class or register it from an exported dumi plugin.`,
      );
    }
  }

  return refs;
}

function toPluginTargetRef(
  target: string | UnifiedPluginFn,
  sourceFiles: string[],
) {
  if (typeof target === 'string') return JSON.stringify(target);

  const found =
    findInRequireCache(target) ?? findInSourceFiles(target, sourceFiles);
  if (!found) {
    const name = target.name ? ` "${target.name}"` : '';

    throw new Error(
      `Utoopack markdown loader requires extra unified plugin function${name} to be exported from a module.`,
    );
  }

  return toRequireRef(found);
}

function toPluginRefs(
  plugins: UnifiedPluginConfig[] = [],
  sourceFiles: string[] = [],
) {
  return `[${plugins
    .map((plugin) => {
      if (Array.isArray(plugin)) {
        const [target, options] = plugin;
        const optionsRef =
          typeof options === 'undefined'
            ? 'undefined'
            : JSON.stringify(options);

        return `[${toPluginTargetRef(
          target as string | UnifiedPluginFn,
          sourceFiles,
        )}, ${optionsRef}]`;
      }

      return toPluginTargetRef(plugin as string | UnifiedPluginFn, sourceFiles);
    })
    .join(', ')}]`;
}

export function buildLoaderContextContent(
  techStacks: IDumiTechStack[],
  builtins: Record<string, { specifier: string; source: string }> = {},
  routes: Record<string, unknown> = {},
  extraRemarkPlugins: IApi['config']['extraRemarkPlugins'] = [],
  extraRehypePlugins: IApi['config']['extraRehypePlugins'] = [],
  sourceFiles: string[] = [],
): string {
  const refs = toTechStackRefs(techStacks, sourceFiles);

  return (
    `'use strict';\n` +
    `try {\n` +
    `  require(${JSON.stringify(
      utilsRegisterPath,
    )}).register.register({ implementor: require(${JSON.stringify(
      esbuildImplementorPath,
    )}) });\n` +
    `} catch (e) {\n` +
    `  console.warn('[dumi] failed to register TS require hook for utoopack loader context:', e);\n` +
    `}\n` +
    `function loadTechStacksFromPlugin(plugin) {\n` +
    `  if (typeof plugin !== 'function') return [];\n` +
    `  const techStacks = [];\n` +
    `  const registerTechStack = (fn) => {\n` +
    `    try {\n` +
    `      const techStack = fn();\n` +
    `      if (techStack) techStacks.push(techStack);\n` +
    `    } catch (e) {\n` +
    `      console.warn('[dumi] failed to register tech stack from utoopack loader context:', e);\n` +
    `    }\n` +
    `  };\n` +
    `  const api = new Proxy({\n` +
    `    cwd: process.cwd(),\n` +
    `    config: {},\n` +
    `    userConfig: {},\n` +
    `    pkg: {},\n` +
    `    paths: {},\n` +
    `    service: {},\n` +
    `    registerTechStack,\n` +
    `    register(opts) {\n` +
    `      if (opts && opts.key === 'registerTechStack' && typeof opts.fn === 'function') {\n` +
    `        registerTechStack(opts.fn);\n` +
    `      }\n` +
    `    },\n` +
    `  }, {\n` +
    `    get(target, key) {\n` +
    `      return key in target ? target[key] : () => {};\n` +
    `    },\n` +
    `  });\n` +
    `  try {\n` +
    `    plugin(api);\n` +
    `  } catch (e) {\n` +
    `    console.warn('[dumi] failed to load tech stack plugin in utoopack loader context:', e);\n` +
    `  }\n` +
    `  return techStacks;\n` +
    `}\n` +
    `exports.techStacks = [${refs.join(', ')}];\n` +
    `exports.builtins = ${JSON.stringify(builtins)};\n` +
    `exports.routes = ${JSON.stringify(routes)};\n` +
    `exports.extraRemarkPlugins = ${toPluginRefs(
      extraRemarkPlugins,
      sourceFiles,
    )};\n` +
    `exports.extraRehypePlugins = ${toPluginRefs(
      extraRehypePlugins,
      sourceFiles,
    )};\n`
  );
}

export const getUtoopackRules = (
  api: IApi,
  config: IApi['config'] = api.config,
): Record<string, unknown> => {
  const disableLiveDemo = shouldDisabledLiveDemo(api);

  const loaderContextPath = path.join(
    api.paths.absTmpPath,
    LOADER_CTX_FILENAME,
  );

  const cfgResolve = config.resolve ?? {};
  const serializableBaseOpts = toSerializable({
    cwd: api.cwd,
    alias: config.alias || {},
    resolve: {
      atomDirs: cfgResolve.atomDirs ?? [{ type: 'component', dir: 'src' }],
      docDirs: cfgResolve.docDirs ?? ['docs'],
      codeBlockMode: cfgResolve.codeBlockMode ?? 'active',
      forceKebabCaseRouting: cfgResolve.forceKebabCaseRouting ?? true,
      ...(cfgResolve.entryFile ? { entryFile: cfgResolve.entryFile } : {}),
    },
    routes: {},
    builtins: {},
    locales: config.locales || [],
    pkg: api.pkg,
    disableLiveDemo,
    [UTOOPACK_LOADER_CTX_KEY]: loaderContextPath,
  });

  const externalDemoLoader = {
    loader: require.resolve('../../loaders/demo'),
    options: toSerializable({
      cwd: api.cwd,
      [UTOOPACK_LOADER_CTX_KEY]: loaderContextPath,
    }),
  };

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
        condition: {
          all: [{ query: /^\?techStack=.*$/ }, { path: /\.tsx$/ }],
        },
        loaders: [externalDemoLoader],
        as: '*.tsx',
      },
      {
        condition: {
          all: [{ query: /^\?techStack=.*$/ }, { path: /\.ts$/ }],
        },
        loaders: [externalDemoLoader],
        as: '*.ts',
      },
      {
        condition: {
          all: [{ query: /^\?techStack=.*$/ }, { path: /\.jsx$/ }],
        },
        loaders: [externalDemoLoader],
        as: '*.jsx',
      },
      {
        condition: {
          all: [
            { query: /^\?techStack=.*$/ },
            { not: { path: /\.(tsx?|jsx)$/ } },
          ],
        },
        loaders: [externalDemoLoader],
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
        condition: { query: /^\?type=demo(?:&.*)?$/ },
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
