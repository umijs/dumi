import type { IDumiTechStack } from '@/types';
import { transformDemoCode } from '../techStackUtils';

export default class ReactTechStack implements IDumiTechStack {
  name = 'react';

  isSupported(...[, lang]: Parameters<IDumiTechStack['isSupported']>) {
    return ['jsx', 'tsx'].includes(lang);
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const isTSX = opts.fileAbsPath.endsWith('.tsx');
      const { code } = transformDemoCode(raw, {
        filename: opts.fileAbsPath,
        parserConfig: {
          syntax: isTSX ? 'typescript' : 'ecmascript',
          [isTSX ? 'tsx' : 'jsx']: true,
        },
      });
      return `React.memo(React.lazy(async () => {
        ${code}
        }))`;
    }
    return raw;
  }
}
