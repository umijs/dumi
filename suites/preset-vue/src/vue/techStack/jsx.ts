import type { PluginItem } from '@umijs/bundler-utils/compiled/@babel/core';
import { transformSync } from '@umijs/bundler-utils/compiled/babel/core';
import type { IDumiTechStack, IDumiTechStackRenderType } from 'dumi';
import { transformDemoCode } from 'dumi/tech-stack-utils';
import type { Element } from 'hast';
import { VUE_RENDERER_KEY } from '../constants';

export default class VueJSXTechStack implements IDumiTechStack {
  name = 'vue3-tsx';

  isSupported(_: Element, lang: string) {
    return ['jsx', 'tsx'].includes(lang);
  }

  render: IDumiTechStackRenderType = {
    type: 'CANCELABLE',
    plugin: VUE_RENDERER_KEY,
  };

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const filename = opts.fileAbsPath;
      const isTSX = filename.endsWith('.tsx');
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
      plugins.push(require.resolve('dumi/compiled/@vue/babel-plugin-jsx'));
      const result = transformSync(raw, {
        filename,
        plugins,
        presets,
      });

      if (result?.code) {
        const { code } = transformDemoCode(result.code, {
          filename,
          parserConfig: {
            syntax: 'ecmascript',
          },
        });
        return `(async function() {
          ${code}
        })()`;
      }
    }
    return raw;
  }
}
