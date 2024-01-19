import { compile } from '@/compiler/node';
import { createVueRuntimeOpts } from '@/shared';
import type {
  IDumiTechStack,
  IDumiTechStackOnBlockLoadArgs,
  IDumiTechStackOnBlockLoadResult,
} from 'dumi/tech-stack-utils';
import { wrapDemoWithFn } from 'dumi/tech-stack-utils';
import hashId from 'hash-sum';
import type { Element } from 'hast';

export default class VueJSXTechStack implements IDumiTechStack {
  name = 'vue3-tsx';

  isSupported(_: Element, lang: string) {
    return ['jsx', 'tsx'].includes(lang);
  }

  runtimeOpts = createVueRuntimeOpts();

  onBlockLoad(
    args: IDumiTechStackOnBlockLoadArgs,
  ): IDumiTechStackOnBlockLoadResult | null {
    if (!args.path.endsWith('.tsx') && !args.path.endsWith('.jsx')) return null;
    const { filename } = args;
    return {
      type: 'tsx',
      content: compile({
        id: filename,
        filename,
        code: args.entryPointCode,
      }) as string,
    };
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const filename = opts.fileAbsPath;

      const result = compile({
        id: hashId(filename),
        filename,
        code: raw,
      }) as string;

      if (result) {
        const code = wrapDemoWithFn(result, {
          filename,
          parserConfig: {
            syntax: 'ecmascript',
          },
        });
        return `(${code})()`;
      }
    }
    return raw;
  }
}
