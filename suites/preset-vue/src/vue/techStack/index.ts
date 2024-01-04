import { join } from 'path';
import type { IApi } from 'umi';
import { winPath } from 'umi/plugin-utils';

import { VUE_RENDERER_KEY } from '../constants';
import VueJSXTechStack from './jsx';
import VueSfcTechStack from './sfc';

export default function registerTechStack(api: IApi) {
  const tplPath = join(__dirname, '../../../templates');

  // generate vue render code
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'index.ts',
      tplPath: join(tplPath, 'render.tpl'),
      context: {
        pluginKey: VUE_RENDERER_KEY,
      },
    });
  });

  api.addRuntimePluginKey(() => [VUE_RENDERER_KEY]);
  api.addRuntimePlugin(() =>
    winPath(join(api.paths.absTmpPath, `plugin-${api.plugin.key}`, 'index.ts')),
  );

  api.register({
    key: 'registerTechStack',
    stage: 0,
    fn: () => new VueJSXTechStack(),
  });

  api.register({
    key: 'registerTechStack',
    stage: 1,
    fn: () => new VueSfcTechStack(),
  });
}
