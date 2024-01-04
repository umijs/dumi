import type {
  IDumiTechStack,
  IDumiTechStackOnBlockLoadArgs,
  IDumiTechStackOnBlockLoadResult,
  IDumiTechStackRenderType,
} from 'dumi';
import { extractScript, transformDemoCode } from 'dumi/tech-stack-utils';
import hashId from 'hash-sum';
import type { Element } from 'hast';
import { dirname, resolve } from 'path';
import { logger } from 'umi/plugin-utils';
import { VUE_RENDERER_KEY } from '../../constants';
import { COMP_IDENTIFIER, compileSFC } from './compile';

export default class VueSfcTechStack implements IDumiTechStack {
  name = 'vue3-sfc';

  isSupported(_: Element, lang: string) {
    return ['vue'].includes(lang);
  }

  onBlockLoad(
    args: IDumiTechStackOnBlockLoadArgs,
  ): IDumiTechStackOnBlockLoadResult {
    return {
      loader: 'tsx',
      contents: extractScript(args.entryPointCode),
    };
  }

  render: IDumiTechStackRenderType = {
    type: 'CANCELABLE',
    plugin: VUE_RENDERER_KEY,
  };

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const filename = !!opts.id
        ? resolve(dirname(opts.fileAbsPath), opts.id, '.vue')
        : opts.fileAbsPath;
      const id = hashId(filename);

      const compiled = compileSFC({ id, filename, code: raw });
      if (Array.isArray(compiled)) {
        logger.error(compiled);
        return '';
      }
      let { js, css } = compiled;
      if (css) {
        js += `\n${COMP_IDENTIFIER}.__css__ = ${JSON.stringify(css)};`;
      }
      js += `\n${COMP_IDENTIFIER}.__id__ = "${id}";
        export default ${COMP_IDENTIFIER};`;

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
