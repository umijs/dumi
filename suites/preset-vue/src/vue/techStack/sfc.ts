import { compile, compiler } from '@/compiler/node';
import { VueRuntimeOptions } from '@/shared';
import type {
  IDumiTechStack,
  IDumiTechStackOnBlockLoadArgs,
  IDumiTechStackOnBlockLoadResult,
} from 'dumi/tech-stack-utils';
import { transformDemoCode } from 'dumi/tech-stack-utils';
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
  ): IDumiTechStackOnBlockLoadResult {
    const result = compiler.compileSFC({
      id: args.path,
      code: args.entryPointCode,
      filename: args.filename,
    });
    return {
      loader: 'tsx',
      contents: Array.isArray(result) ? '' : result.js,
    };
  }

  runtime = VueRuntimeOptions;

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

      const { code } = transformDemoCode(js, {
        filename,
        parserConfig: {
          syntax: 'ecmascript',
        },
      });
      return `(async function() {
        ${code}
      })()`;
    }
    return raw;
  }
}
