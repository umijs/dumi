import fs from 'fs';
import path from 'path';
import { IApi } from '@umijs/types';
import getTheme from '../../theme/loader';

export default (api: IApi) => {
  api.chainWebpack(async memo => {
    const theme = await getTheme();

    // set alias for dumi theme api
    memo.resolve.alias.set('dumi/theme', path.join(__dirname, '../../theme'));

    // compile theme path for npm linked theme
    if (fs.existsSync(theme.modulePath)) {
      memo.module.rule('js').include.add(fs.realpathSync((await getTheme()).modulePath));
    }

    return memo;
  });
};
