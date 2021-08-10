import fs from 'fs';
import path from 'path';
import { minify } from 'terser';
import type { IApi } from '@umijs/types';
import getTheme from '../../theme/loader';
import { setOptions } from '../../context';

// initialize data-prefers-color attr for HTML tag
const COLOR_HEAD_SCP = `
(function () {
  var cache = localStorage.getItem('dumi:prefers-color');
  var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var enums = ['light', 'dark', 'auto'];

  document.documentElement.setAttribute(
    'data-prefers-color',
    cache === enums[2]
      ? (isDark ? enums[1] : enums[0])
      : (enums.indexOf(cache) > -1 ? cache : enums[0])
  );
})();
`;

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

    // set alias for builtin default theme
    memo.resolve.alias.set('dumi-theme-default', path.dirname(require.resolve('dumi-theme-default/package.json')));

    // compile theme path for npm linked theme
    if (fs.existsSync(theme.modulePath)) {
      memo.module.rule('js').include.add(fs.realpathSync((await getTheme()).modulePath));
    }

    return memo;
  });

  // add head script to initialize prefers-color-schema for HTML tag
  api.addHTMLHeadScripts(async () => [{ content: (await minify(COLOR_HEAD_SCP, { ecma: 5 })).code }]);
};
