import { compile, compiler } from '@/compiler/node';
import { logger } from 'dumi/plugin-utils';
import type { IDumiTechStackRuntimeOpts } from 'dumi/tech-stack-utils';
import { defineTechStack, wrapDemoWithFn } from 'dumi/tech-stack-utils';
import hashId from 'hash-sum';

export const VueSfcTechStack = (runtimeOpts: IDumiTechStackRuntimeOpts) =>
  defineTechStack({
    name: 'vue3-sfc',
    runtimeOpts,
    isSupported(_, lang: string) {
      return ['vue'].includes(lang);
    },
    onBlockLoad(args) {
      if (!args.path.endsWith('.vue')) return null;
      const result = compiler.compileSFC({
        id: args.path,
        code: args.entryPointCode,
        filename: args.filename,
      });
      return {
        type: 'tsx',
        content: Array.isArray(result) ? '' : result.js,
      };
    },
    transformCode(raw, opts) {
      if (opts.type === 'code-block') {
        const filename = opts.fileAbsPath;
        const id = hashId(raw);

        const js = compile({ id, filename, code: raw });
        if (Array.isArray(js)) {
          logger.error(js);
          return '';
        }

        const code = wrapDemoWithFn(js, {
          filename,
          parserConfig: {
            syntax: 'ecmascript',
          },
        });
        return `(${code})()`;
      }
      return raw;
    },
  });
