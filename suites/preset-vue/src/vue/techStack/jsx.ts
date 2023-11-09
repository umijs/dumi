import type { PluginItem } from '@umijs/bundler-utils/compiled/@babel/core';
import { transformSync } from '@umijs/bundler-utils/compiled/babel/core';
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
      const presets: PluginItem[] = [];
      if (isTSX) {
        presets.push([
          require.resolve(
            '@umijs/bundler-utils/compiled/babel/preset-typescript',
          ),
          { isTSX, allExtensions: isTSX },
        ]);
      }
      plugins.push(
        require.resolve('dumi/compiled/@vue/babel-plugin-jsx'),
        require.resolve('babel-plugin-iife'),
      );
      const result = transformSync(raw, {
        filename: opts.fileAbsPath,
        plugins,
        presets,
      });
      return (result?.code || '').replace(/;$/g, '');
    }
    return raw;
  }
}
