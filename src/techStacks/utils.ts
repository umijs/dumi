import type { ParserConfig } from '@swc/core';
import { transformSync } from '@swc/core';
import type {
  ParserOptions,
  PluginItem,
} from '@umijs/bundler-utils/compiled/@babel/core';
import { IDumiTechStack } from '../types';

export {
  IDumiTechStack,
  IDumiTechStackOnBlockLoadArgs,
  IDumiTechStackOnBlockLoadResult,
  IDumiTechStackRuntimeOpts,
} from '../types';

/**
 * for frameworks like vue , we need to extract the JS fragments in their scripts
 * @param htmlLike HTML, vue and other html-like files are available
 * @returns js/ts code
 */
export function extractScript(htmlLike: string) {
  const htmlScriptReg = /<script\b(?:\s[^>]*>|>)(.*?)<\/script>/gims;
  let match = htmlScriptReg.exec(htmlLike);
  let scripts = '';
  while (match) {
    scripts += match[1] + '\n';
    match = htmlScriptReg.exec(htmlLike);
  }
  return scripts;
}

type BabelCore = typeof import('@umijs/bundler-utils/compiled/babel/core');

export interface IWrapDemoWithFnOptions {
  filename: string;
  parserConfig: ParserConfig;
  /**
   * babel plugins which will be applied to the original code before wrapping.
   * The wrapping rewrites static imports into dynamic imports, so plugins which
   * rely on import declarations (e.g. @emotion/babel-plugin) must run before it,
   * otherwise they never see the original `import` statements.
   */
  babelPlugins?: PluginItem[];
}

/**
 * Apply babel plugins to the demo code while keeping its syntax as-is
 * (no preset, only parse & print), so the result can still be handled by swc.
 */
export function applyBabelPlugins(
  code: string,
  opts: Pick<IWrapDemoWithFnOptions, 'filename' | 'parserConfig'> & {
    plugins: PluginItem[];
  },
) {
  const { filename, parserConfig, plugins } = opts;

  if (!plugins.length) return code;

  // lazy require, babel is only needed when plugins are configured
  const babel: BabelCore = require('@umijs/bundler-utils/compiled/babel/core');
  const parserPlugins: NonNullable<ParserOptions['plugins']> = [];

  if (parserConfig.syntax === 'typescript') {
    parserPlugins.push('typescript');
    if (parserConfig.tsx) parserPlugins.push('jsx');
  } else if (parserConfig.jsx) {
    parserPlugins.push('jsx');
  }

  const result = babel.transformSync(code, {
    filename,
    babelrc: false,
    configFile: false,
    browserslistConfigFile: false,
    sourceType: 'module',
    sourceMaps: false,
    compact: false,
    parserOpts: { plugins: parserPlugins },
    plugins,
  });

  return result?.code ?? code;
}

/**
 * Use swc to convert es module into async function.
 * More transform process detail, refer to:
 * https://github.com/umijs/dumi/blob/master/crates/swc_plugin_react_demo/src/lib.rs#L126
 */
export function wrapDemoWithFn(code: string, opts: IWrapDemoWithFnOptions) {
  const { filename, parserConfig, babelPlugins } = opts;
  const source = babelPlugins?.length
    ? applyBabelPlugins(code, {
        filename,
        parserConfig,
        plugins: babelPlugins,
      })
    : code;
  const result = transformSync(source, {
    filename: filename,
    jsc: {
      parser: parserConfig,
      target: 'es2022',
      experimental: {
        cacheRoot: 'node_modules/.cache/swc',
        plugins: [
          [
            require.resolve('../../compiled/crates/swc_plugin_react_demo.wasm'),
            {},
          ],
        ],
      },
    },
    module: {
      type: 'es6',
    },
  });
  return `async function() {
  ${result.code}
}`;
}

export type IDefineTechStackOptions = IDumiTechStack;

/**
 * Define a tech stack
 * @param options techstack options
 * @returns function that returns {@link IDumiTechStack}, can be used to register a techstack
 *
 * @example
 * const ReactTechStack = defineTechStack({
 *   name: 'jsx',
 *   isSupported(_, lang) {
 *     return ['jsx', 'tsx'].includes(lang);
 *   },
 *   transformCode() {
 *     // ...
 *     return '';
 *   },
 * });
 *
 * api.registerTechStack(() => ReactTechStack);
 */
export function defineTechStack(options: IDefineTechStackOptions) {
  return options;
}
