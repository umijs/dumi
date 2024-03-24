import type { ParserConfig } from '@swc/core';
import { transformSync } from '@swc/core';
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

export interface IWrapDemoWithFnOptions {
  filename: string;
  parserConfig: ParserConfig;
}

/**
 * Use swc to convert es module into async function.
 * More transform process detail, refer to:
 * https://github.com/umijs/dumi/blob/master/crates/swc_plugin_react_demo/src/lib.rs#L126
 */
export function wrapDemoWithFn(code: string, opts: IWrapDemoWithFnOptions) {
  const { filename, parserConfig } = opts;
  const result = transformSync(code, {
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
