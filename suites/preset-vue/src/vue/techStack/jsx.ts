import type { PluginItem } from '@babel/core';
import { transformSync } from '@babel/core';
import type { IDumiTechStack } from 'dumi';
import type { Element } from 'hast';

export default class VueJSXTechStack implements IDumiTechStack {
  name = 'vue3-tsx';

  isSupported(_: Element, lang: string) {
    return ['jsx', 'tsx'].includes(lang);
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const isTSX = opts.fileAbsPath.endsWith('.tsx');
      const plugins: PluginItem[] = [];
      if (isTSX) {
        plugins.push([
          '@babel/plugin-transform-typescript',
          { isTSX, allExtensions: isTSX },
        ]);
      }
      plugins.push(
        require.resolve('@vue/babel-plugin-jsx'),
        require.resolve('babel-plugin-iife'),
      );
      const result = transformSync(raw, {
        filename: opts.fileAbsPath,
        plugins,
      });
      return (result?.code || '').replace(/;$/g, '');
    }
    return raw;
  }
}
