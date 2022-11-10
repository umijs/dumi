import { parseCodeFrontmatter } from '@/utils';
import { build } from '@umijs/bundler-utils/compiled/esbuild';
import assert from 'assert';
import type { ExampleBlockAsset } from 'dumi-assets-types';
import type { sync } from 'enhanced-resolve';
import fs from 'fs';
import path from 'path';
import { pkgUp, winPath } from 'umi/plugin-utils';

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
}) {
  const asset: IParsedBlockAsset['asset'] = {
    type: 'BLOCK',
    id: opts.id,
    refAtomIds: opts.refAtomIds,
    dependencies: {},
  };
  const result: IParsedBlockAsset = {
    asset,
    sources: {},
    frontmatter: null,
  };

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
                asset.dependencies[args.path] = {
                  type: 'NPM',
                  value: require(pkgJsonPath).version,
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
            const isModule = ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
            const isPlainText = [
              '.css',
              '.less',
              '.sass',
              '.scss',
              '.styl',
              '.json',
            ].includes(ext);
            const isEntryPoint = args.pluginData.kind === 'entry-point';
            const filename = isEntryPoint
              ? `index${ext}`
              : winPath(
                  path.relative(path.dirname(opts.fileAbsPath), args.path),
                );

            if (isModule || isPlainText) {
              asset.dependencies[filename] = {
                type: 'FILE',
                value:
                  opts.entryPointCode ?? fs.readFileSync(args.path, 'utf-8'),
              };

              // extract entry point frontmatter as asset metadata
              if (isEntryPoint) {
                const { code, frontmatter } = parseCodeFrontmatter(
                  asset.dependencies[filename].value,
                );

                if (frontmatter) {
                  // replace entry code when frontmatter available
                  asset.dependencies[filename].value = code;
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

              return {
                // only continue to load for module files
                contents: isModule ? asset.dependencies[filename].value : '',
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
