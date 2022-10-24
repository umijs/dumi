import { FRAMEWORK_NAME } from '@/service/constants';
import { Env } from '@umijs/core';
import { winPath } from '@umijs/utils';
import { join } from 'path';
import type { IApi } from './types';

function winJoin(...args: string[]) {
  return winPath(join(...args));
}

export default (api: IApi) => {
  api.describe({ key: 'dumi:registerMethods' });

  [
    'registerTechStack',
    'addContentTab',
    'modifyAssetsMetadata',
    'modifyTheme',
  ].forEach((name) => {
    api.registerMethod({ name });
  });

  // 处理 paths
  api.modifyPaths((memo) => {
    const tmp =
      api.env === Env.development
        ? `.${FRAMEWORK_NAME}`
        : `.${FRAMEWORK_NAME}-${api.env}`;

    memo.absSrcPath = memo.cwd;
    memo.absTmpPath = winJoin(api.cwd, tmp);
    return memo;
  });
};
