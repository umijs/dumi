import { compile } from '@/compiler/node';
import type { IDumiTechStackRuntimeOpts } from 'dumi/tech-stack-utils';
import { createTechStack, wrapDemoWithFn } from 'dumi/tech-stack-utils';
import hashId from 'hash-sum';

export const VueJSXTechStack = (runtimeOpts: IDumiTechStackRuntimeOpts) =>
  createTechStack({
    name: 'vue3-tsx',
    runtimeOpts,
    isSupported(lang: string) {
      return ['jsx', 'tsx'].includes(lang);
    },
    onBlockLoad(args) {
      if (!args.path.endsWith('.tsx') && !args.path.endsWith('.jsx'))
        return null;
      const { filename } = args;
      return {
        type: 'tsx',
        content: compile({
          id: filename,
          filename,
          code: args.entryPointCode,
        }) as string,
      };
    },
    transformCode(raw, opts) {
      if (opts.type === 'code-block') {
        const filename = opts.fileAbsPath;

        const result = compile({
          id: hashId(raw),
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
    },
  });
