import type { IDumiTechStack } from '@/types';
import { wrapDemoWithFn } from './utils';

export default class ReactTechStack implements IDumiTechStack {
  name = 'react';

  runtimeOpts?: IDumiTechStack['runtimeOpts'] = {
    compilePath: require.resolve('../client/misc/reactDemoCompiler'),
  };

  isSupported(...[, lang]: Parameters<IDumiTechStack['isSupported']>) {
    return ['jsx', 'tsx'].includes(lang);
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const isTSX = opts.fileAbsPath.endsWith('.tsx');
      const code = wrapDemoWithFn(raw, {
        filename: opts.fileAbsPath,
        parserConfig: {
          syntax: isTSX ? 'typescript' : 'ecmascript',
          [isTSX ? 'tsx' : 'jsx']: true,
        },
      });
      return `React.memo(React.lazy(${code}))`;
    }
    return raw;
  }
}
