import { LOCAL_THEME_DIR, PICKED_PKG_FIELDS, THEME_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import { parseModuleSync } from '@umijs/bundler-utils';
import fs from 'fs';
import path from 'path';
import { deepmerge, lodash, winPath } from 'umi/plugin-utils';
import { safeExcludeInMFSU } from '../derivative';
import loadTheme, { IThemeLoadResult } from './loader';

const DEFAULT_THEME_PATH = path.join(__dirname, '../../../theme-default');

/**
 * get pkg theme name
 */
function getPkgThemeName(api: IApi) {
  const validDeps = Object.assign(
    {},
    api.pkg.dependencies,
    api.pkg.devDependencies,
  );
  const pkgThemeName = Object.keys(validDeps).find((pkg) =>
    pkg.split('/').pop()!.startsWith(THEME_PREFIX),
  );

  return pkgThemeName;
}

/**
 * get theme package path from package.json
 */
function getPkgThemePath(api: IApi) {
  const pkgThemeName = getPkgThemeName(api);

  return (
    pkgThemeName &&
    path.dirname(
      require.resolve(`${pkgThemeName}/package.json`, { paths: [api.cwd] }),
    )
  );
}

export default (api: IApi) => {
  // load default theme
  const defaultThemeData = loadTheme(DEFAULT_THEME_PATH);
  // try to load theme package
  const pkgThemePath = getPkgThemePath(api);
  const pkgThemeData = deepmerge(
    defaultThemeData,
    pkgThemePath ? loadTheme(path.join(pkgThemePath, 'dist')) : {},
  );
  // try to read local theme
  const localThemePath = path.join(api.cwd, LOCAL_THEME_DIR);
  const localThemeData = fs.existsSync(localThemePath)
    ? loadTheme(localThemePath)
    : undefined;
  const themeMapKeys: ('layouts' | 'builtins' | 'slots')[] = [
    'layouts',
    'builtins',
    'slots',
  ];
  let originalThemeData: IThemeLoadResult;

  api.describe({ key: 'dumi:theme' });

  // register theme's plugin if exists
  [pkgThemeData.plugin, localThemeData?.plugin].forEach((plugin) => {
    if (plugin) {
      api.registerPlugins([plugin]);
    }
  });

  // skip mfsu for client api, to avoid circular resolve in mfsu mode
  safeExcludeInMFSU(
    api,
    ['dumi/theme-default', '@ant-design/icons-svg', getPkgThemeName(api)]
      .filter(Boolean)
      .map((pkg) => new RegExp(pkg!)),
  );

  api.register({
    key: 'modifyAppData',
    // prepare themeData before umi appData, for generate layout routes
    before: 'appData',
    async fn(memo: any) {
      // allow to modify theme data via plugin API
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
        DumiDemo: {
          specifier: '{ DumiDemo }',
          source: 'dumi',
        },
        DumiDemoGrid: {
          specifier: '{ DumiDemoGrid }',
          source: 'dumi',
        },
        Link: {
          specifier: '{ Link }',
          source: 'dumi',
        },
      });

      return memo;
    },
  });

  api.modifyConfig((memo) => {
    // alias each component from local theme, as a part of final theme
    if (localThemeData) {
      themeMapKeys.forEach((key) => {
        Object.values(localThemeData[key] || {}).forEach((item) => {
          memo.alias[`dumi/theme/${key}/${item.specifier}`] = item.source;
        });
      });
    }
    // alias final theme to fall back to original theme
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
        // skip write internal components
        if (item.source === 'dumi') return;

        let contents = [];
        // parse exports for theme module
        const [, exports] = parseModuleSync({
          path: item.source,
          content: fs.readFileSync(item.source, 'utf-8'),
        });

        // export default
        if (exports.includes('default')) {
          contents.push(`export { default } from '${item.source}';`);
        }

        // export members
        if (exports.some((exp) => exp !== 'default')) {
          contents.push(`export * from '${item.source}';`);
        }

        api.writeTmpFile({
          noPluginDir: true,
          path: `dumi/theme/${key}/${item.specifier}.ts`,
          content: contents.join('\n'),
        });
      });
    });

    // generate context layout
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/theme/ContextWrapper.tsx',
      content: `import React, { useState, useEffect, useRef } from 'react';
import { useOutlet, history } from 'dumi';
import { SiteContext } from '${winPath(
        require.resolve('../../client/theme-api/context'),
      )}';
import { demos, components } from '../meta';
import { locales } from '../locales/config';

export default function DumiContextWrapper() {
  const outlet = useOutlet();
  const [loading, setLoading] = useState(true);
  const prev = useRef(history.location.pathname);

  useEffect(() => {
    return history.listen((next) => {
      // mark loading when route change, page component will set false when loaded
      setLoading(true);

      // scroll to top when route changed
      if (next.location.pathname !== prev.current) {
        prev.current = next.location.pathname;
        document.documentElement.scrollTo(0, 0);
      }
    });
  }, []);

  return (
    <SiteContext.Provider value={{
      pkg: ${JSON.stringify(
        lodash.pick(api.pkg, ...Object.keys(PICKED_PKG_FIELDS)),
      )},
      demos,
      components,
      locales,
      loading,
      setLoading,
      themeConfig: ${JSON.stringify(
        Object.assign(
          lodash.pick(api.config, 'logo', 'description', 'title'),
          api.config.themeConfig,
        ),
      )},
    }}>
      {outlet}
    </SiteContext.Provider>
  );
}`,
    });
  });

  // workaround for avoid oom, when developing theme package example in tnpm node_modules
  if (
    /*isTnpm*/ require('@umijs/core/package').__npminstall_done &&
    fs.existsSync(localThemePath) &&
    fs.lstatSync(localThemePath).isSymbolicLink()
  ) {
    api.chainWebpack((memo) => {
      const devThemeNodeModules = path.join(api.cwd, '../node_modules');

      memo.snapshot(
        deepmerge(memo.get('snapshot'), {
          immutablePaths: [devThemeNodeModules],
          managedPaths: [devThemeNodeModules],
        }),
      );

      return memo;
    });
  }
};
