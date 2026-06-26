import { getContentHash, parseCodeFrontmatter } from '@/utils';
import { build } from '@umijs/bundler-utils/compiled/esbuild';
import assert from 'assert';
import type { ExampleBlockAsset } from 'dumi-assets-types';
import type { sync } from 'enhanced-resolve';
import fs from 'fs';
import path from 'path';
import { pkgUp, winPath } from 'umi/plugin-utils';
import {
  DEFAULT_DEMO_MODULE_EXTENSIONS,
  DEFAULT_DEMO_PLAIN_TEXT_EXTENSIONS,
} from '../constants';
import { IDumiTechStack } from '../types';

export interface IParsedBlockAsset {
  asset: ExampleBlockAsset;
  /**
   * resolveMap: {
   *   '@/constants': '/path/to/constants.ts',
   *   'antd/es/button': '/path/to/antd/es/button/index.jsx',
   * }
   */
  resolveMap: Record<string, string>;
  frontmatter: ReturnType<typeof parseCodeFrontmatter>['frontmatter'];
}

interface IParseBlockAssetOptions {
  fileAbsPath: string;
  fileLocale?: string;
  id: string;
  refAtomIds: string[];
  entryPointCode?: string;
  resolver: typeof sync;
  techStack: IDumiTechStack;
  cacheable?: boolean;
}

type BlockAssetCache = {
  deps: string[];
  depsKey: string;
  result: IParsedBlockAsset;
};

const MAX_BLOCK_ASSET_CACHE_SIZE = 512;
const blockAssetCache = new Map<string, BlockAssetCache>();

function cloneParsedBlockAsset(ret: IParsedBlockAsset): IParsedBlockAsset {
  return {
    asset: JSON.parse(JSON.stringify(ret.asset)),
    resolveMap: { ...ret.resolveMap },
    frontmatter: ret.frontmatter
      ? JSON.parse(JSON.stringify(ret.frontmatter))
      : ret.frontmatter,
  };
}

function getContentHashFromFile(file: string) {
  try {
    return getContentHash(fs.readFileSync(file, 'utf-8'));
  } catch {
    return 'missing';
  }
}

function getDepsKey(deps: string[]) {
  return JSON.stringify(
    Array.from(new Set(deps))
      .sort()
      .map((file) => `${winPath(file)}:${getContentHashFromFile(file)}`),
  );
}

function getParseCacheKey(opts: IParseBlockAssetOptions) {
  const entryContent =
    opts.entryPointCode ?? fs.readFileSync(opts.fileAbsPath, 'utf-8');

  return JSON.stringify({
    file: winPath(opts.fileAbsPath),
    fileLocale: opts.fileLocale,
    id: opts.id,
    refAtomIds: opts.refAtomIds,
    entryHash: getContentHash(entryContent),
    techStack: opts.techStack.name,
    runtimeOpts: opts.techStack.runtimeOpts,
    hasOnBlockLoad: Boolean(opts.techStack.onBlockLoad),
    hasGenerateMetadata: Boolean(opts.techStack.generateMetadata),
    hasGenerateSources: Boolean(opts.techStack.generateSources),
  });
}

function getParseDeps(ret: IParsedBlockAsset, entryFile: string) {
  return Object.values(ret.resolveMap).filter(
    (file) => path.isAbsolute(file) && file !== entryFile,
  );
}

function getCachedBlockAsset(cacheKey: string) {
  const cached = blockAssetCache.get(cacheKey);

  if (cached && cached.depsKey === getDepsKey(cached.deps)) {
    return cloneParsedBlockAsset(cached.result);
  }
}

function setCachedBlockAsset(
  cacheKey: string,
  ret: IParsedBlockAsset,
  deps: string[],
) {
  if (blockAssetCache.size >= MAX_BLOCK_ASSET_CACHE_SIZE) {
    const firstKey = blockAssetCache.keys().next().value;
    if (firstKey) blockAssetCache.delete(firstKey);
  }

  blockAssetCache.set(cacheKey, {
    deps,
    depsKey: getDepsKey(deps),
    result: cloneParsedBlockAsset(ret),
  });
}

async function parseBlockAsset(opts: IParseBlockAssetOptions) {
  const cacheKey = opts.cacheable ? getParseCacheKey(opts) : '';
  const cached = cacheKey ? getCachedBlockAsset(cacheKey) : undefined;

  if (cached) {
    return cached;
  }

  const asset: IParsedBlockAsset['asset'] = {
    type: 'BLOCK',
    id: opts.id,
    refAtomIds: opts.refAtomIds,
    dependencies: {},
    entry: '',
  };
  const result: IParsedBlockAsset = {
    asset,
    resolveMap: {},
    frontmatter: null,
  };
  // demo dependency analysis and asset processing
  const deferrer = build({
    // do not emit file
    write: false,
    // enable bundle for trigger onResolve hook, but all deps will be externalized
    bundle: true,
    logLevel: 'silent',
    format: 'esm',
    target: 'esnext',
    // esbuild need relative entry path
    entryPoints: [path.basename(opts.fileAbsPath)],
    absWorkingDir: path.dirname(opts.fileAbsPath),
    plugins: [
      {
        name: 'plugin-dumi-collect-deps',
        setup: (builder) => {
          builder.onResolve({ filter: /.*/ }, (args) => {
            if (args.kind !== 'entry-point' && !args.path.startsWith('.')) {
              const resolved = opts.resolver(args.resolveDir, args.path);
              assert(
                resolved,
                `Can't resolve ${args.path} from ${args.resolveDir}`,
              );
              const pkgJsonPath = pkgUp.pkgUpSync({
                cwd: resolved,
              });

              if (pkgJsonPath) {
                const pkg = require(pkgJsonPath);

                asset.dependencies[pkg.name] = {
                  type: 'NPM',
                  value: pkg.version,
                };
                if (opts.techStack.runtimeOpts)
                  result.resolveMap[args.path] = args.path;
              }

              // make all deps external
              return { path: args.path, external: true };
            }

            return {
              path:
                args.kind !== 'entry-point'
                  ? (opts.resolver(args.resolveDir, args.path) as string)
                  : path.join(args.resolveDir, args.path),
              pluginData: {
                kind: args.kind,
                resolveDir: args.resolveDir,
                source: args.path,
              },
            };
          });

          builder.onLoad({ filter: /.*/ }, (args) => {
            let ext = path.extname(args.path);
            const techStack = opts.techStack;

            const isEntryPoint = args.pluginData.kind === 'entry-point';

            // always add extname for highlight in runtime
            const filename = `${
              isEntryPoint
                ? 'index'
                : winPath(
                    path.format({
                      ...path.parse(args.pluginData.source),
                      base: '',
                      ext: '',
                    }),
                  )
            }${ext}`;

            let entryPointCode = opts.entryPointCode;
            let contents: string | undefined = undefined;

            if (techStack.onBlockLoad) {
              const result = techStack.onBlockLoad({
                filename,
                entryPointCode: (entryPointCode ??= fs.readFileSync(
                  args.path,
                  'utf-8',
                )),
                ...args,
              });
              if (result) {
                ext = `.${result.type}`;
                contents = result.content;
              }
            }

            let isModule = DEFAULT_DEMO_MODULE_EXTENSIONS.includes(ext);
            let isPlainText = DEFAULT_DEMO_PLAIN_TEXT_EXTENSIONS.includes(ext);

            if (isModule || isPlainText) {
              asset.dependencies[filename] = {
                type: 'FILE',
                value:
                  opts.entryPointCode ?? fs.readFileSync(args.path, 'utf-8'),
              };

              const file = asset.dependencies[filename];

              // extract entry point frontmatter as asset metadata
              if (isEntryPoint) {
                const { code, frontmatter } = parseCodeFrontmatter(file.value);
                asset.entry = filename;

                if (frontmatter) {
                  // replace entry code when frontmatter available
                  file.value = code;
                  asset.dependencies[filename].value = code;

                  // TODO: locale for title & description
                  ['description', 'title', 'snapshot', 'keywords'].forEach(
                    (key) => {
                      asset[key as keyof IParsedBlockAsset['asset']] =
                        frontmatter?.[key];
                    },
                  );

                  // support locale prefix for title & description
                  ['description', 'title'].forEach((key) => {
                    frontmatter[key] =
                      frontmatter[`${key}.${opts.fileLocale}`] ||
                      frontmatter[key];
                  });

                  result.frontmatter = frontmatter;
                }
              }

              // save file absolute path for load file via raw-loader
              // to avoid bundle same file to save bundle size
              if (
                opts.techStack.runtimeOpts &&
                (!isEntryPoint || !opts.entryPointCode)
              ) {
                result.resolveMap[filename] = args.path;
              }

              return {
                // only continue to load for module files
                contents: isModule ? contents ?? file.value : '',
                loader: isModule ? (ext.slice(1) as any) : 'text',
              };
            }
          });
        },
      },
    ],
  });

  let hasError = false;
  try {
    await deferrer;
  } catch {
    hasError = true;
    /**
     * eat errors, for preserve the dependency relationship of demo & md for md loader
     * to make sure the parent md can be re-compiling when demo errors be fixed
     * and don't worry, the real error still be reported by the demo loader
     */
  }

  if (!hasError && cacheKey) {
    setCachedBlockAsset(
      cacheKey,
      result,
      getParseDeps(result, opts.fileAbsPath),
    );
  }

  return result;
}

export default parseBlockAsset;
