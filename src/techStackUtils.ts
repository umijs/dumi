import type { ParserConfig } from '@swc/core';
import { transformSync } from '@swc/core';

export {
  IDumiTechStack,
  IDumiTechStackOnBlockLoadArgs,
  IDumiTechStackOnBlockLoadResult,
  IDumiTechStackRuntimeOptions,
} from './types';

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

export interface TransformDemoCodeOptions {
  filename: string;
  parserConfig: ParserConfig;
}

/**
 * Use swc to convert es module into statements inside the function body.
 * More transform process detail, refer to:
 * https://github.com/umijs/dumi/blob/master/crates/swc_plugin_react_demo/src/lib.rs#L126
 */
export function transformDemoCode(
  code: string,
  opts: TransformDemoCodeOptions,
) {
  const { filename, parserConfig } = opts;
  return transformSync(code, {
    filename: filename,
    jsc: {
      parser: parserConfig,
      target: 'es2022',
      experimental: {
        cacheRoot: 'node_modules/.cache/swc',
        plugins: [
          [
            require.resolve('../compiled/crates/swc_plugin_react_demo.wasm'),
            {},
          ],
        ],
      },
    },
    module: {
      type: 'es6',
    },
  });
}
