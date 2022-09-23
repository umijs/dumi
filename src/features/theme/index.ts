import { LOCAL_THEME_DIR, THEME_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import fs from 'fs';
import path from 'path';
import { deepmerge } from 'umi/plugin-utils';
import loadTheme, { IThemeLoadResult } from './loader';

const DEFAULT_THEME_PATH = path.join(__dirname, '../../../theme-default');

/**
 * get theme package path from package.json
 */
function getPkgThemePath(api: IApi) {
  const validDeps = Object.assign(
    {},
    api.pkg.dependencies,
    api.pkg.devDependencies,
  );
  const pkgThemeName = Object.keys(validDeps).find((pkg) =>
    pkg.split('/').pop()!.startsWith(THEME_PREFIX),
  );

  return (
    pkgThemeName &&
    path.basename(
      require.resolve(`${pkgThemeName}/package.json`, { paths: [api.cwd] }),
    )
  );
}

export default (api: IApi) => {
  // try to read local theme
  const localThemePath = path.join(api.cwd, LOCAL_THEME_DIR);
  const localThemeData =
    fs.existsSync(localThemePath) && loadTheme(localThemePath);
  const themeMapKeys: ('layouts' | 'builtins' | 'slots')[] = [
    'layouts',
    'builtins',
    'slots',
  ];
  let originalThemeData: IThemeLoadResult;

  api.describe({ key: 'dumi:theme' });

  api.register({
    key: 'modifyAppData',
    // prepare themeData before umi appData, for generate layout routes
    before: 'appData',
    async fn(memo: any) {
      // load default theme
      const defaultThemeData = loadTheme(DEFAULT_THEME_PATH);
      // try to load theme package
      const pkgThemePath = getPkgThemePath(api);
      const pkgThemeData = deepmerge(
        defaultThemeData,
        pkgThemePath ? loadTheme(pkgThemePath) : {},
      );

      // allow modify theme data via plugin API
      originalThemeData = await api.applyPlugins({
        key: 'modifyTheme',
        initialValue: pkgThemeData,
      });
      // save to service rather than appData
      // because layout routes are generated before appData is created
      api.service.themeData = originalThemeData;

      // merge local theme data
      if (localThemeData) {
        api.service.themeData = deepmerge(originalThemeData, localThemeData, {
          clone: true,
        });
      }

      // append internal components, not allow override
      Object.assign(api.service.themeData.builtins, {
        // TODO: Link...
        DumiDemo: {
          specifier: '{ DumiDemo }',
          source: 'dumi/theme',
        },
        DumiDemoGrid: {
          specifier: '{ DumiDemoGrid }',
          source: 'dumi/theme',
        },
      });

      return memo;
    },
  });

  api.modifyConfig((memo) => {
    // alias theme api
    memo.alias['dumi/theme$'] = require.resolve('../../client/theme-api');
    // alias each component from local theme, as a part of final theme
    if (localThemeData) {
      themeMapKeys.forEach((key) => {
        Object.values(localThemeData[key] || {}).forEach((item) => {
          memo.alias[`dumi/theme/${key}/${item.specifier}`] = item.source;
        });
      });
    }
    // alias final theme to fallback to original theme
    memo.alias['dumi/theme'] = 'dumi/theme-original';
    // alias original theme to temp dir
    memo.alias['dumi/theme-original'] = path.join(
      api.paths.absTmpPath,
      'dumi/theme',
    );
    // alias default theme
    memo.alias['dumi/theme-default'] = DEFAULT_THEME_PATH;

    // FIXME: for replace deps by MFSU in local
    memo.extraBabelIncludes ??= [];
    memo.extraBabelIncludes.push(
      path.resolve(__dirname, '../../client/theme-api'),
    );

    return memo;
  });

  api.onGenerateFiles(() => {
    // write shadow theme files to tmp dir
    themeMapKeys.forEach((key) => {
      Object.values(originalThemeData[key] || {}).forEach((item) => {
        api.writeTmpFile({
          noPluginDir: true,
          path: `dumi/theme/${key}/${item.specifier}.ts`,
          content: `export * from '${item.source}';\nexport { default } from '${item.source}';`,
        });
      });
    });

    // generate context layout
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/theme/ContextWrapper.tsx',
      content: `import { Context } from 'dumi/theme';
import { useOutlet } from 'umi';
import { demos } from '../meta';
import { locales } from '../locales/config';

export default function DumiContextWrapper() {
  const outlet = useOutlet();

  return (
    <Context.Provider value={{ demos, locales }}>{outlet}</Context.Provider>
  );
}`,
    });
  });
};
