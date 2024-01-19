import { compile, compiler } from '@/compiler/node';
import { createVueRuntimeOpts } from '@/shared';
import type {
  IDumiTechStack,
  IDumiTechStackOnBlockLoadArgs,
  IDumiTechStackOnBlockLoadResult,
} from 'dumi/tech-stack-utils';
import { wrapDemoWithFn } from 'dumi/tech-stack-utils';
import hashId from 'hash-sum';
import type { Element } from 'hast';
import { dirname, resolve } from 'path';
import { logger } from 'umi/plugin-utils';

export default class VueSfcTechStack implements IDumiTechStack {
  name = 'vue3-sfc';

  isSupported(_: Element, lang: string) {
    return ['vue'].includes(lang);
  }

  onBlockLoad(
    args: IDumiTechStackOnBlockLoadArgs,
  ): IDumiTechStackOnBlockLoadResult | null {
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
  }

  runtimeOpts = createVueRuntimeOpts();

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const filename = !!opts.id
        ? resolve(dirname(opts.fileAbsPath), opts.id, '.vue')
        : opts.fileAbsPath;
      const id = hashId(filename);

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
  }
}
