import type { IDumiTechStackRuntimeOpts } from 'dumi/tech-stack-utils';
import { join } from 'path';
import process from 'process';
import type { IApi } from 'umi';
import { winPath } from 'umi/plugin-utils';

export const BABEL_STANDALONE_CDN =
  'https://cdn.bootcdn.net/ajax/libs/babel-standalone/7.22.17/babel.min.js';

const libPath = '@dumijs/preset-vue/lib/';

export function createVueRuntimeOpts(): IDumiTechStackRuntimeOpts {
  const cwd = process.cwd();
  return {
    compilePath: require.resolve(join(libPath, 'compiler.mjs'), {
      paths: [cwd],
    }),
    rendererPath: require.resolve(join(libPath, 'renderer.mjs'), {
      paths: [cwd],
    }),
    pluginPath: require.resolve(join(libPath, 'runtimePlugin.mjs'), {
      paths: [cwd],
    }),
  };
}

export function getPluginPath(api: IApi, filename: string) {
  return winPath(
    join(api.paths.absTmpPath, `plugin-${api.plugin.key}`, filename),
  );
}
