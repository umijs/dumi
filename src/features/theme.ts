import type { IApi } from '@/types';
import path from 'path';

export default (api: IApi) => {
  api.describe({ key: 'dumi:theme' });
  api.modifyConfig((memo) => {
    memo.alias['dumi/theme'] = require.resolve('../client/theme');

    // FIXME: for replace deps by MFSU in local
    memo.extraBabelIncludes ??= [];
    memo.extraBabelIncludes.push(path.resolve(__dirname, '../client/theme'));

    return memo;
  });
};
