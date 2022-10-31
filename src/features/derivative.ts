import { LOCAL_DUMI_DIR } from '@/constants';
import type { IApi } from '@/types';
import path from 'path';
import { glob, winPath } from 'umi/plugin-utils';

function getFilesByGlob(globExp: string, dir: string) {
  return glob
    .sync(globExp, { cwd: dir })
    .map((file) => winPath(path.join(dir, file)));
}

/**
 * plugin for derive default behaviors from umi
 */
export default (api: IApi) => {
  const dumiAbsDir = path.join(api.cwd, LOCAL_DUMI_DIR);
  const strategies = {
    // TODO: umi need read appJS from appData
    // ref: https://github.com/umijs/umi/blob/9551b4d7832bc30088af75ecea60a0572d8ad767/packages/preset-umi/src/features/tmpFiles/tmpFiles.ts#L375
    appJS: getFilesByGlob.bind(null, 'app.{js,jsx,ts,tsx}', dumiAbsDir),
    globalCSS: getFilesByGlob.bind(
      null,
      'global.{css,less,scss,sass}',
      dumiAbsDir,
    ),
    globalJS: getFilesByGlob.bind(null, 'global.{js,jsx,ts,tsx}', dumiAbsDir),
    overridesCSS: getFilesByGlob.bind(
      null,
      'overrides.{css,less,scss,sass}',
      dumiAbsDir,
    ),
  };

  api.describe({ key: 'dumi:derivative' });

  // move all conventional files to .dumi dir
  api.modifyAppData((memo) => {
    Object.entries(strategies).forEach(([key, fn]) => {
      memo[key] = fn();
    });

    return memo;
  });

  api.onGenerateFiles(() => {
    Object.entries(strategies).forEach(([key, fn]) => {
      api.appData[key] = fn();
    });
  });

  // register .dumi/app as runtime plugin
  api.addRuntimePlugin(() => {
    return strategies.appJS().slice(0, 1);
  });
};
