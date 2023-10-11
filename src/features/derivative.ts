import {
  LOCAL_DUMI_DIR,
  LOCAL_PAGES_DIR,
  LOCAL_THEME_DIR,
  USELESS_TMP_FILES,
} from '@/constants';
import type { IApi } from '@/types';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { chalk, deepmerge, fsExtra, logger, winPath } from 'umi/plugin-utils';

function isMFSUAvailable(api: IApi) {
  return (
    // maybe not working on windows
    process.platform !== 'win32' &&
    // allow user to disable mfsu
    api.userConfig.mfsu !== false &&
    // mfsu will interrupt 2-level esm for strip-ansi with unknown reason
    // ref: https://github.com/umijs/dumi/issues/1587
    api.pkg.type !== 'module'
  );
}

/**
 * exclude pre-compiling modules in mfsu mode
 * and make sure there has no multiple instances problem (such as react)
 */
export function safeExcludeInMFSU(api: IApi, excludes: RegExp[]) {
  if (isMFSUAvailable(api)) {
    api.modifyConfig((memo) => {
      if (memo.mfsu === false) return memo;
      else if (memo.mfsu === true) memo.mfsu = {};

      memo.mfsu ??= {};
      memo.mfsu.exclude = deepmerge(memo.mfsu.exclude || [], excludes);

      // to avoid multiple instance of react in mfsu mode
      memo.extraBabelIncludes ??= [];
      memo.extraBabelIncludes.push(...excludes);

      return memo;
    });
  }
}

/**
 * plugin for derive default behaviors from umi
 */
export default (api: IApi) => {
  api.describe({ key: 'dumi:derivative' });

  // pre-check config
  api.onCheck(() => {
    // unsuitable config for library development
    [
      'clientLoader',
      'deadCode',
      'icons',
      'mdx',
      'mpa',
      'reactRouter5Compat',
      'verifyCommit',
    ].forEach((key) => {
      assert(!api.config[key], `${key} is not supported in dumi!`);
    });

    // not supported config for temporary
    ['vite', 'PhantomDependency'].forEach((key) => {
      assert(!api.config[key], `${key} is not supported yet!`);
    });

    if (typeof api.config.mfsu === 'object') {
      assert(
        api.config.mfsu.strategy !== 'eager',
        'MFSU eager mode is not supported yet!',
      );
      assert(
        api.config.mfsu.esbuild !== true,
        'MFSU esbuild bundler is not supported yet!',
      );
    }

    assert(
      !api.config.ssr || api.config.ssr.builder === 'webpack',
      'Only `webpack` builder is supported in SSR mode!',
    );
    assert(
      api.config.cssLoader?.modules === undefined &&
        api.config.cssLoaderModules === undefined,
      'CSS Modules is not supported! Because it is not suitable for UI library development, please use normal CSS, Less, etc. instead.',
    );
    if (api.userConfig.history && api.userConfig.history.type === 'hash') {
      logger.warn(
        'Hash history is temporarily incompatible, it is recommended to use browser history for now.',
      );
    }

    const { themeConfig } = api.config;
    if (themeConfig?.nav) {
      const hasOrder = !!JSON.stringify(themeConfig.nav).includes('"order":');
      if (hasOrder) {
        logger.warn(
          `\`order\` is deprecated in \`themeConfig.nav\`, you can order them directly in config`,
        );
      }
    }

    // check tsconfig.json
    try {
      const tsconfigPath = path.join(api.cwd, 'tsconfig.json');
      const tsconfig: { include?: string[] } = require(tsconfigPath);

      // auto remove wrong `.dumi/**/*` from previous dumi versions
      const dotDumiWildcard = `${LOCAL_DUMI_DIR}/**/*`;
      if (tsconfig.include?.includes(dotDumiWildcard)) {
        tsconfig.include = tsconfig.include.filter(
          (i) => i !== dotDumiWildcard,
        );
        fs.writeFileSync(
          tsconfigPath,
          JSON.stringify(tsconfig, null, 2),
          'utf-8',
        );
        logger.info(
          `tsconfig.json \`include\` option has been patched automatically, please check and commit it.
          ${chalk.grey('see also: https://github.com/umijs/dumi/pull/1902')}`,
        );
      }

      // auto add tsconfig.json for .dumi dir
      const dotDumiPath = path.join(api.cwd, LOCAL_DUMI_DIR);
      const dotDumiTsconfigPath = path.join(dotDumiPath, 'tsconfig.json');
      const hasDotDumiTsFiles =
        fs.existsSync(dotDumiPath) &&
        fs
          .readdirSync(dotDumiPath)
          .some(
            (f) =>
              LOCAL_PAGES_DIR.endsWith(`/${f}`) ||
              LOCAL_THEME_DIR.endsWith(`/${f}`) ||
              /\.tsx?$/.test(f),
          );
      if (
        hasDotDumiTsFiles &&
        !fs.existsSync(dotDumiTsconfigPath) &&
        !tsconfig.include?.some((i) => /(\.\/)?.dumi\//.test(i))
      ) {
        fs.writeFileSync(
          dotDumiTsconfigPath,
          JSON.stringify(
            { extends: '../tsconfig.json', include: ['**/*'] },
            null,
            2,
          ),
          'utf-8',
        );
        logger.info(
          'In order to make type prompt works for theme files, .dumi/tsconfig.json has been created automatically, please check and commit it.',
        );
      }

      // check type prompt for config file
      const configFileName =
        api.service.configManager?.mainConfigFile &&
        path.basename(api.service.configManager?.mainConfigFile);
      if (
        configFileName &&
        // only .dumirc.ts need to be included in the root tsconfig.json, because the dot files will be excluded by default
        /^\..+\.ts$/.test(configFileName) &&
        !tsconfig.include?.includes(configFileName)
      ) {
        logger.warn(
          `Please append \`${configFileName}\` into \`include\` option of tsconfig.json, to make sure the type prompt works for it.`,
        );
      }
    } catch {}
  });

  // skip mfsu for client api, to avoid circular resolve in mfsu mode
  safeExcludeInMFSU(api, [
    new RegExp('dumi/dist/client'),
    // for useSiteSearch api
    new RegExp('compiled/_internal/searchWorker'),
  ]);

  api.modifyDefaultConfig((memo) => {
    if (!isMFSUAvailable(api)) {
      memo.mfsu = false;
    } else {
      // only normal mode is supported, because src is not fixed in dumi project, eager mode may scan wrong dir
      memo.mfsu.strategy = 'normal';

      // make react singleton, because MFSU only process import
      // but the parsed code block demo will has require('react')
      memo.mfsu.shared = {
        react: { singleton: true },
        'react-dom': { singleton: true },
      };
    }

    // enable conventional routes
    // @ts-ignore
    if (api.userConfig.conventionRoutes !== false) {
      memo.conventionRoutes = {
        base: path.join(api.cwd, LOCAL_PAGES_DIR),
        exclude: [/(\/|^)(\.|_\/)/],
      };
    }

    // use webpack builder by default in ssr mode
    if (api.userConfig.ssr) {
      memo.ssr = Object.assign(memo.ssr || {}, { builder: 'webpack' });
    }

    // enable hash by default
    memo.hash = true;

    // enable exportStatic by default
    memo.exportStatic ||= {};

    // enable esbuildMinifyIIFE by default
    memo.esbuildMinifyIIFE = true;

    return memo;
  });

  api.modifyConfig((memo) => {
    if (api.userConfig.alias?.['@']) {
      // respect user @ alias
      // because dumi force to use .dumi as absSrcPath for move all conventional
      // files (such as app.ts) to .dumi, but Umi force to set absSrcPath as @
      // ref: https://github.com/umijs/umi/blob/6e1bd3a8a8a9ec86c8ac6f11f68b9c3dc897e8ad/packages/preset-umi/src/features/configPlugins/configPlugins.ts#L105
      memo.alias['@'] = api.userConfig.alias['@'];
    } else {
      // fallback to use src as @ first, like Umi
      memo.alias['@'] = winPath(
        [path.join(api.cwd, 'src'), api.cwd].find(fs.existsSync)!,
      );
    }

    return memo;
  });

  // force to disable auto CSSModules
  api.modifyBabelPresetOpts((memo) => {
    delete memo.pluginAutoCSSModules;

    return memo;
  });

  // remove tsconfig.json, because the paths in tsconfig.json cannot be resolved in dumi project
  api.register({
    key: 'onGenerateFiles',
    // make sure after umi generate files
    stage: Infinity,
    fn() {
      USELESS_TMP_FILES.forEach((file) => {
        fsExtra.rmSync(path.join(api.paths.absTmpPath, file), { force: true });
      });
    },
  });

  // built-in other umi plugins (such as analytics)
  api.registerPlugins([require.resolve('../../compiled/@umijs/plugins')]);

  // skip useless umi built-in plugins
  [
    // skip prepare plugin since umi@4.0.48, because it is not compatible with dumi currently
    'prepare',
    // skip routeProps plugin since umi@4.0.53, because dumi support conventional route props by default
    'routeProps',
  ].forEach((plugin) => {
    if (api.isPluginEnable(plugin)) api.skipPlugins([plugin]);
  });
};
