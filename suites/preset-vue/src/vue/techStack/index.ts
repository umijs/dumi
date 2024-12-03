import {
  BABEL_STANDALONE_CDN,
  getPkgPath,
  getPluginPath,
  TYPESCRIPT_STANDALONE_CDN,
} from '@/shared';
import type { IApi } from 'dumi';
import { fsExtra } from 'dumi/plugin-utils';
import { join } from 'path';
import { VueJSXTechStack } from './jsx';
import { VueSfcTechStack } from './sfc';

const COMPILE_FILENAME = 'compiler.mjs';
const RENDERER_FILENAME = 'renderer.mjs';
const PREFLIGHT_FILENAME = 'preflight.mjs';

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
    api.writeTmpFile({
      path: PREFLIGHT_FILENAME,
      content: fsExtra.readFileSync(join(libPath, PREFLIGHT_FILENAME), 'utf8'),
    });
  });

  const runtimeOpts = {
    compilePath: getPluginPath(api, COMPILE_FILENAME),
    rendererPath: getPluginPath(api, RENDERER_FILENAME),
    preflightPath: getPluginPath(api, PREFLIGHT_FILENAME),
    pluginPath: join(libPath, 'runtimePlugin.mjs'),
  };

  // mark @babel/standalone as external

  if (vueConfig.supportTsMetadata) {
    // @ts-ignore set option global so compile can get
    globalThis.supportTsMetadata = true;
  }
  api.addHTMLHeadScripts(() => {
    const scripts = [
      {
        src: vueConfig?.compiler?.babelStandaloneCDN || BABEL_STANDALONE_CDN,
        async: true,
      },
    ];
    if (vueConfig.supportTsMetadata) {
      scripts.push({
        src: vueConfig?.compiler?.typescriptCDN || TYPESCRIPT_STANDALONE_CDN,
        async: true,
      });
    }
    return scripts;
  });
  api.modifyConfig((memo) => {
    memo.externals = {
      ...memo.externals,
      '@babel/standalone': 'Babel',
      typescript: 'ts',
    };
    return memo;
  });

  api.register({
    key: 'registerTechStack',
    stage: 0,
    fn: () => VueJSXTechStack(runtimeOpts),
  });

  api.register({
    key: 'registerTechStack',
    stage: 1,
    fn: () => VueSfcTechStack(runtimeOpts),
  });
}
