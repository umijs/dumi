import type { IDumiTechStack } from '@/types';
import { transformSync } from '@swc/core';

export default class ReactTechStack implements IDumiTechStack {
  name = 'react';

  isSupported(...[, lang]: Parameters<IDumiTechStack['isSupported']>) {
    return ['jsx', 'tsx'].includes(lang);
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const isTSX = opts.fileAbsPath.endsWith('.tsx');
      const { code } = transformSync(raw, {
        filename: opts.fileAbsPath,
        jsc: {
          parser: {
            syntax: isTSX ? 'typescript' : 'ecmascript',
            [isTSX ? 'tsx' : 'jsx']: true,
          },
          target: 'es2022',
          experimental: {
            cacheRoot: 'node_modules/.cache/swc',
            plugins: [
              [
                require.resolve(
                  '../../compiled/crates/swc_plugin_react_demo.wasm',
                ),
                {},
              ],
            ],
          },
        },
        module: {
          type: 'es6',
        },
      });

      return `React.memo(React.lazy(async () => {
${code}
}))`;
    }

    return raw;
  }
}
