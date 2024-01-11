import { compile } from '@/compiler/node';
import { VueRuntimeOptions } from '@/shared';
import type { IDumiTechStack } from 'dumi/tech-stack-utils';
import { transformDemoCode } from 'dumi/tech-stack-utils';
import type { Element } from 'hast';

export default class VueJSXTechStack implements IDumiTechStack {
  name = 'vue3-tsx';

  isSupported(_: Element, lang: string) {
    return ['jsx', 'tsx'].includes(lang);
  }

  runtime = VueRuntimeOptions;

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const filename = opts.fileAbsPath;

      const result = compile({
        filename,
        id: filename,
        code: raw,
      }) as string;

      if (result) {
        const { code } = transformDemoCode(result, {
          filename,
          parserConfig: {
            syntax: 'ecmascript',
          },
        });
        return `(async function() {
          ${code}
        })()`;
      }
    }
    return raw;
  }
}
