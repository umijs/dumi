import fs from 'fs';
import path from 'path';
import type { IApi } from '@umijs/types';
import getTheme from '../../theme/loader';
import { setOptions } from '../../context';

/**
 * plugin for alias dumi/theme module for export theme API
 */
export default (api: IApi) => {
  api.describe({
    key: 'themeConfig',
    config: {
      schema(joi) {
        return joi.object();
      },
      default: {},
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('theme', memo.themeConfig);

    return memo;
  });

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
