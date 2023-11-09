import { type TransformOptions } from '@umijs/bundler-utils/compiled/@babel/core';
import { transformSync } from '@umijs/bundler-utils/compiled/babel/core';
import type { IDumiBlockHandler, IDumiTechStack } from 'dumi';
import hashId from 'hash-sum';
import type { Element } from 'hast';
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

type GetBlockHandlerArgs = Parameters<
  NonNullable<IDumiTechStack['getBlockHandler']>
>[0];

export default class VueSfcTechStack implements IDumiTechStack {
  name = 'vue3-sfc';

  isSupported(_: Element, lang: string) {
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

  getBlockHandler(args: GetBlockHandlerArgs): IDumiBlockHandler {
    return {
      loader: 'tsx',
      transform: 'html',
      isModule: args.path.endsWith('.vue'),
    };
  }
}
