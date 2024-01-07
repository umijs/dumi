import { parseCodeFrontmatter } from '@/utils';
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
  sources: Record<string, string>;
  frontmatter: ReturnType<typeof parseCodeFrontmatter>['frontmatter'];
}

async function parseBlockAsset(opts: {
  fileAbsPath: string;
  id: string;
  refAtomIds: string[];
  entryPointCode?: string;
  resolver: typeof sync;
  techStack: IDumiTechStack;
}) {
  const asset: IParsedBlockAsset['asset'] = {
    type: 'BLOCK',
    id: opts.id,
    refAtomIds: opts.refAtomIds,
    dependencies: {},
    entry: '',
  };
  const result: IParsedBlockAsset = {
    asset,
    sources: {},
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
              }

              // make all deps external
              return { path: args.path, external: true };
            }

            return {
              path:
                args.kind !== 'entry-point'
                  ? (opts.resolver(args.resolveDir, args.path) as string)
                  : path.join(args.resolveDir, args.path),
              pluginData: { kind: args.kind, resolveDir: args.resolveDir },
            };
          });

          builder.onLoad({ filter: /.*/ }, (args) => {
            const ext = path.extname(args.path);
            const techStack = opts.techStack;

            let isModule = DEFAULT_DEMO_MODULE_EXTENSIONS.includes(ext);
            let isPlainText = DEFAULT_DEMO_PLAIN_TEXT_EXTENSIONS.includes(ext);

            const isEntryPoint = args.pluginData.kind === 'entry-point';
            const filename = winPath(
              path.relative(path.dirname(opts.fileAbsPath), args.path),
            )
              // discard leading ./ or ../
              .replace(/^(\.?\.\/)+/g, '');

            if (techStack.onBlockLoad || isModule || isPlainText) {
              asset.dependencies[filename] = {
                type: 'FILE',
                value:
                  opts.entryPointCode ?? fs.readFileSync(args.path, 'utf-8'),
              };

              const entryFile = asset.dependencies[filename];

              // extract entry point frontmatter as asset metadata
              if (isEntryPoint) {
                const { code, frontmatter } = parseCodeFrontmatter(
                  entryFile.value,
                );
                asset.entry = filename;

                if (frontmatter) {
                  // replace entry code when frontmatter available
                  entryFile.value = code;
                  result.frontmatter = frontmatter;

                  // TODO: locale for title & description
                  ['description', 'title', 'snapshot', 'keywords'].forEach(
                    (key) => {
                      asset[key as keyof IParsedBlockAsset['asset']] =
                        frontmatter?.[key];
                    },
                  );
                }
              }

              // save file absolute path for load file via raw-loader
              // to avoid bundle same file to save bundle size
              if (!isEntryPoint || !opts.entryPointCode) {
                result.sources[filename] = args.path;
              }

              if (techStack.onBlockLoad) {
                return techStack.onBlockLoad({
                  entryPointCode: entryFile.value,
                  ...args,
                });
              }

              return {
                // only continue to load for module files
                contents: isModule ? entryFile.value : '',
                loader: isModule ? (ext.slice(1) as any) : 'text',
              };
            }
          });
        },
      },
    ],
  });

  try {
    await deferrer;
  } catch {
    /**
     * eat errors, for preserve the dependency relationship of demo & md for md loader
     * to make sure the parent md can be re-compiling when demo errors be fixed
     * and don't worry, the real error still be reported by the demo loader
     */
  }

  return result;
}

export default parseBlockAsset;
