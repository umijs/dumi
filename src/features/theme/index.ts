import {
  LOCAL_THEME_DIR,
  PICKED_PKG_FIELDS,
  PREFERS_COLOR_ATTR,
  THEME_PREFIX,
  VERSION_2_LEVEL_NAV,
} from '@/constants';
import type { IApi } from '@/types';
import { parseModuleSync } from '@umijs/bundler-utils';
import fs from 'fs';
import path from 'path';
import { deepmerge, lodash, resolve, semver, winPath } from 'umi/plugin-utils';
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
      resolve.sync(`${pkgThemeName}/package.json`, {
        basedir: api.cwd,
        preserveSymlinks: true,
      }),
    )
  );
}

/**
 * get exports for module
 */
function getModuleExports(modulePath: string) {
  return parseModuleSync({
    path: modulePath,
    content: fs.readFileSync(modulePath, 'utf-8'),
  })[1];
}

/**
 * check if package dumi version is minor 2
 */
function checkMinor2ByPkg(pkg: IApi['pkg']) {
  // for dumi local example project
  if (pkg.name?.startsWith('@examples/')) return true;

  const ver =
    pkg.peerDependencies?.dumi || pkg.devDependencies?.dumi || '^2.0.0';

  return semver.subset(ver, VERSION_2_LEVEL_NAV);
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
    [
      'dumi/theme-default',
      // for svgr
      '@ant-design/icons-svg',
      getPkgThemeName(api),
    ]
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

  api.modifyAppData((memo) => {
    // auto enable 2-level nav by declared dumi version, for existing projects compatibility
    // ref: https://github.com/umijs/dumi/discussions/1618
    memo._2LevelNavAvailable = checkMinor2ByPkg(api.pkg);

    // always respect theme package declaration, for theme compatibility
    if (pkgThemePath && !memo._2LevelNavAvailable) {
      memo._2LevelNavAvailable = checkMinor2ByPkg(
        require(path.join(pkgThemePath, 'package.json')),
      );
    }

    return memo;
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

  // set dark mode selector as less variable
  // why not use `theme` or `modifyVars`?
  // because `theme` will be override by `modifyVars` in umi
  // and `modifyVar` will override `theme` from user
  api.chainWebpack((memo) => {
    const lessRule = memo.module.rule('less');

    ['css', 'css-modules'].forEach((rule) => {
      Object.values(lessRule.oneOf(rule).uses.entries()).forEach((loader) => {
        if (loader.get('loader').includes('less-loader')) {
          loader.tap((opts) => {
            opts.lessOptions.modifyVars ??= {};
            opts.lessOptions.modifyVars[
              'dark-selector'
            ] = `~'[${PREFERS_COLOR_ATTR}="dark"]'`;

            return opts;
          });
        }
      });
    });

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
        const exports = getModuleExports(item.source);

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

    const entryFile =
      api.config.resolve.entryFile &&
      [path.resolve(api.cwd, api.config.resolve.entryFile)].find(fs.existsSync);
    const entryExports = entryFile ? getModuleExports(entryFile) : [];
    const hasDefaultExport = entryExports.includes('default');
    const hasNamedExport = entryExports.some((exp) => exp !== 'default');
    const enableNProgress = !!api.config.themeConfig.nprogress;

    // generate context layout
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/theme/ContextWrapper.tsx',
      content: `import React, { useState, useEffect, useRef } from 'react';
import { useOutlet, history } from 'dumi';
${
  enableNProgress
    ? `
import nprogress from '${winPath(
        path.dirname(require.resolve('nprogress/package')),
      )}';
import './nprogress.css';
`
    : ''
}
import { SiteContext } from '${winPath(
        require.resolve('../../client/theme-api/context'),
      )}';
import { demos, components } from '../meta';
import { locales } from '../locales/config';${
        hasDefaultExport
          ? `\nimport entryDefaultExport from '${winPath(entryFile!)}';`
          : ''
      }${
        hasNamedExport
          ? `\nimport * as entryMemberExports from '${winPath(entryFile!)}';`
          : ''
      }

const entryExports = {
  ${hasDefaultExport ? 'default: entryDefaultExport,' : ''}
  ${hasNamedExport ? '...entryMemberExports,' : ''}
};

export default function DumiContextWrapper() {
  const outlet = useOutlet();
  const [loading, setLoading] = useState(true);
  const prev = useRef(history.location.pathname);

  useEffect(() => {
    return history.listen((next) => {
      if (next.location.pathname !== prev.current) {
        prev.current = next.location.pathname;

        // mark loading when route change, page component will set false when loaded
        setLoading(true);

        // start nprogress
        ${enableNProgress ? `nprogress.start();` : ''}

        // scroll to top when route changed
        document.documentElement.scrollTo(0, 0);
      }
    });
  }, []);

  return (
    <SiteContext.Provider value={{
      pkg: ${JSON.stringify(
        lodash.pick(api.pkg, ...Object.keys(PICKED_PKG_FIELDS)),
      )},
      historyType: "${api.config.history?.type || 'browser'}",
      entryExports,
      demos,
      components,
      locales,
      loading,
      setLoading,
      hostname: ${JSON.stringify(api.config.sitemap?.hostname)},
      themeConfig: ${JSON.stringify(
        Object.assign(
          lodash.pick(api.config, 'logo', 'description', 'title'),
          api.config.themeConfig,
        ),
      )},
      _2_level_nav_available: ${api.appData._2LevelNavAvailable},
    }}>
      {outlet}
    </SiteContext.Provider>
  );
}`,
    });

    const primaryColor =
      typeof api.config?.theme === 'object'
        ? api.config?.theme?.['@c-primary']
        : '#1677ff';

    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/theme/nprogress.css',
      content: `
      /* https://unpkg.com/browse/nprogress@0.2.0/nprogress.css */
      #nprogress {
        pointer-events: none;
      }

      #nprogress .bar {
        background: var;
        position: fixed;
        z-index: 1031;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
      }

      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px ${primaryColor}, 0 0 5px ${primaryColor};
        opacity: 1.0;
        transform: rotate(3deg) translate(0px, -4px);
      }

      #nprogress .spinner {
        display: block;
        position: fixed;
        z-index: 1031;
        top: 15px;
        right: 15px;
      }

      #nprogress .spinner-icon {
        width: 18px;
        height: 18px;
        box-sizing: border-box;
        border: solid 2px transparent;
        border-top-color: ${primaryColor};
        border-left-color: ${primaryColor};
        border-radius: 50%;
        animation: nprogress-spinner 400ms linear infinite;
      }

      .nprogress-custom-parent {
        overflow: hidden;
        position: relative;
      }

      .nprogress-custom-parent #nprogress .spinner,
      .nprogress-custom-parent #nprogress .bar {
        position: absolute;
      }

      @keyframes nprogress-spinner {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      `,
    });
  });

  // read prefers-color from localStorage before app render
  api.addEntryCodeAhead(() => {
    const { prefersColor } = api.config.themeConfig;

    if (prefersColor.switch === false && prefersColor.default !== 'auto') {
      return `document.documentElement.setAttribute('${PREFERS_COLOR_ATTR}', '${prefersColor.default}');`;
    }

    return `(function () {
  var cache = typeof navigator !== 'undefined' && navigator.cookieEnabled && typeof window.localStorage !== 'undefined' && localStorage.getItem('dumi:prefers-color') || '${prefersColor.default}';
  var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var enums = ['light', 'dark', 'auto'];

  document.documentElement.setAttribute(
    '${PREFERS_COLOR_ATTR}',
    cache === enums[2]
      ? (isDark ? enums[1] : enums[0])
      : (enums.indexOf(cache) > -1 ? cache : enums[0])
  );
})();`;
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
