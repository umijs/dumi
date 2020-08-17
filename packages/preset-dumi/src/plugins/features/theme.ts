import fs from 'fs';
import path from 'path';
import { IApi } from '@umijs/types';
import getTheme from '../../theme/loader';

export default (api: IApi) => {
  api.chainWebpack(memo => {
    // set alias for dumi theme api
    memo.resolve.alias.set('dumi/theme', path.join(__dirname, '../../theme'));

    // compile theme path for npm linked theme
    memo.module.rule('js').include.add(fs.realpathSync(getTheme().modulePath));

    return memo;
  });
};
