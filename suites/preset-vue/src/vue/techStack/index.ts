import { BABEL_STANDALONE_CDN, getPkgPath, getPluginPath } from '@/shared';
import type { IApi } from 'dumi';
import { fsExtra } from 'dumi/plugin-utils';
import { join } from 'path';
import { VueJSXTechStack } from './jsx';
import { VueSfcTechStack } from './sfc';

const COMPILE_FILENAME = 'compiler.mjs';
const RENDERER_FILENAME = 'renderer.mjs';

export default function registerTechStack(api: IApi) {
  const vueConfig = api.userConfig?.vue;

  const pkgPath = getPkgPath('@dumijs/preset-vue', api.cwd);

  const libPath = join(pkgPath, '/lib');

  // vue-related runtime files must be placed under .dumi
  // so that the correct dependencies can be referenced.
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: COMPILE_FILENAME,
      content: fsExtra.readFileSync(join(libPath, COMPILE_FILENAME), 'utf8'),
    });
    api.writeTmpFile({
      path: RENDERER_FILENAME,
      content: fsExtra.readFileSync(join(libPath, RENDERER_FILENAME), 'utf8'),
    });
  });

  const runtimeOpts = {
    compilePath: getPluginPath(api, COMPILE_FILENAME),
    rendererPath: getPluginPath(api, RENDERER_FILENAME),
    pluginPath: join(libPath, 'runtimePlugin.mjs'),
  };

  // mark @babel/standalone as external
  api.addHTMLHeadScripts(() => {
    return [
      {
        src: vueConfig?.compiler?.babelStandaloneCDN || BABEL_STANDALONE_CDN,
        async: true,
      },
    ];
  });
  api.modifyConfig((memo) => {
    memo.externals = {
      ...memo.externals,
      '@babel/standalone': 'Babel',
    };
    return memo;
  });

  api.register({
    key: 'registerTechStack',
    stage: 0,
    fn: VueJSXTechStack(runtimeOpts),
  });

  api.register({
    key: 'registerTechStack',
    stage: 1,
    fn: VueSfcTechStack(runtimeOpts),
  });
}
