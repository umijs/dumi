import type { IApi } from '@/types';
import { winPath } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.describe({ key: 'dumi:exports' });

  // allow import from dumi
  api.modifyConfig((memo) => {
    memo.alias['dumi$'] = '@@/dumi/exports';

    return memo;
  });

  // exports all theme api from dumi
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/exports.ts',
      content: `export * from '../exports';
export * from '${winPath(require.resolve('../client/theme-api'))}';`,
    });
  });
};
