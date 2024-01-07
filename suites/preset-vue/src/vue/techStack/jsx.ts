import type { BabelCore } from 'dumi/bundler-utils';
import { babelCore, babelPresetTypeScript } from 'dumi/bundler-utils';

import type {
  IDumiTechStack,
  IDumiTechStackRenderType,
} from 'dumi/tech-stack-utils';
import { transformDemoCode } from 'dumi/tech-stack-utils';
import type { Element } from 'hast';
import { VUE_RENDERER_KEY, VueBabelJsxPlugin } from '../constants';

const { transformSync } = babelCore();

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
      const plugins: BabelCore.PluginItem[] = [];
      const presets: BabelCore.PluginItem[] = [];
      if (isTSX) {
        presets.push([
          babelPresetTypeScript(),
          { isTSX, allExtensions: isTSX },
        ]);
      }
      plugins.push(VueBabelJsxPlugin);
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
