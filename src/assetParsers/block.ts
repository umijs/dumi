import { parseCodeFrontmatter } from '@/utils';
import { build } from '@umijs/bundler-utils/compiled/esbuild';
import assert from 'assert';
import type { ExampleBlockAsset } from 'dumi-assets-types';
import type { sync } from 'enhanced-resolve';
import fs from 'fs';
import path from 'path';
import { pkgUp, winPath } from 'umi/plugin-utils';
import { DEFAULT_DEMO_EXTENSIONS } from '../constants';
import { IDumiConfig } from '../types';

export interface IParsedBlockAsset {
  asset: ExampleBlockAsset;
  sources: Record<string, string>;
  frontmatter: ReturnType<typeof parseCodeFrontmatter>['frontmatter'];
}

// for frameworks like vue , we need to extract the JS fragments in their scripts
function extraScript(htmlLike: string) {
  const htmlScriptReg = /<script\b(?:\s[^>]*>|>)(.*?)<\/script>/gims;
  let match = htmlScriptReg.exec(htmlLike);
  let scripts = '';
  while (match) {
    scripts += match[1] + '\n';
    match = htmlScriptReg.exec(htmlLike);
  }
  return scripts;
}

async function parseBlockAsset(opts: {
  fileAbsPath: string;
  id: string;
  refAtomIds: string[];
  entryPointCode?: string;
  resolver: typeof sync;
  resolveDemoModule?: IDumiConfig['resolveDemoModule'];
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
            const resolver = opts.resolveDemoModule ?? {};

            const ext = path.extname(args.path);
            const isModule =
              DEFAULT_DEMO_EXTENSIONS.includes(ext) || !!resolver[ext];
            const isPlainText = [
              '.css',
              '.less',
              '.sass',
              '.scss',
              '.styl',
              '.json',
            ].includes(ext);
            const isEntryPoint = args.pluginData.kind === 'entry-point';
            const filename = winPath(
              path.relative(path.dirname(opts.fileAbsPath), args.path),
            )
              // discard leading ./ or ../
              .replace(/^(\.?\.\/)+/g, '');

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
                asset.entry = filename;

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

              let contents = asset.dependencies[filename].value;

              if (resolver[ext]) {
                const { transform, loader } = resolver[ext];
                contents =
                  transform === 'html'
                    ? extraScript(contents)
                    : transform(contents);
                return { contents, loader };
              }
              return {
                // only continue to load for module files
                contents: isModule ? contents : '',
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
