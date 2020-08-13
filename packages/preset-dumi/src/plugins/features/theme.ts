import path from 'path';
import { IApi } from '@umijs/types';

export default (api: IApi) => {
  // set alias for dumi theme api
  api.chainWebpack(memo => {
    memo.resolve.alias.set('dumi/theme', path.join(__dirname, '../../theme'));

    return memo;
  });
};
