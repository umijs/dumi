import type { IApi } from '@/types';
import { toImportSpecifier } from '@/utils';

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
export * from '${toImportSpecifier(require.resolve('../client/theme-api'))}';
export * from './meta/exports';`,
    });
  });
};
