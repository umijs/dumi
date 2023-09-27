import { TransformOptions, transformSync } from '@babel/core';
import type { IDumiTechStack } from 'dumi';
import hashId from 'hash-sum';
import { dirname, resolve } from 'path';
import { logger } from 'umi/plugin-utils';
import { COMP_IDENTIFIER, compileSFC } from './compile';

function transpile(source: string, opts?: TransformOptions) {
  const result = transformSync(source, {
    plugins: [require.resolve('babel-plugin-iife')],
    ...opts,
  });
  return result?.code || '';
}

export default class VueSfcTechStack implements IDumiTechStack {
  name = 'vue3-sfc';

  isSupported(...[, lang]: Parameters<IDumiTechStack['isSupported']>) {
    return ['vue'].includes(lang);
  }

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
      return transpile(js).replace(/;$/g, '');
    }
    return raw;
  }
}
