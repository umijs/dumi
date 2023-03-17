import { LOCAL_PAGES_DIR, USELESS_TMP_FILES } from '@/constants';
import type { IApi } from '@/types';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { deepmerge, fsExtra, logger, semver, winPath } from 'umi/plugin-utils';

function isMFSUAvailable(api: IApi) {
  return process.platform !== 'win32' && api.userConfig.mfsu !== false;
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
    assert(!api.config.mpa, 'MPA mode is not supported in dumi!');
    assert(!api.config.vite, 'Vite mode is not supported yet!');
    assert(
      !api.config.phantomDependency,
      'PhantomDependency is not supported yet!',
    );

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
      api.config.cssLoader?.modules === undefined,
      'CSS Modules is not supported! Because it is not suitable for UI library development, please use normal CSS, Less, etc. instead.',
    );
    if (api.userConfig.history?.type === 'hash') {
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
      const tsconfig = require(path.join(api.cwd, 'tsconfig.json'));
      const expected = ['.dumi/**/*'];

      if (api.service.configManager?.mainConfigFile?.endsWith('.ts')) {
        expected.push(
          winPath(
            path.relative(api.cwd, api.service.configManager.mainConfigFile),
          ),
        );
      }

      if (!expected.every((f) => tsconfig.include?.includes(f))) {
        logger.warn(
          `Please append ${expected
            .map((e) => `\`${e}\``)
            .join(
              ' & ',
            )} into \`include\` option of \`tsconfig.json\`, to make sure the types exported by framework works.`,
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
      // FIXME: mfsu will broken on window platform for unknown reason
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

      // replace @/loading from umi.ts, because dumi use `<rootDir>/.dumi` as absSrcPath
      const umiPath = path.join(api.paths.absTmpPath, 'umi.ts');
      fsExtra.writeFileSync(
        umiPath,
        fsExtra
          .readFileSync(umiPath, 'utf-8')
          .replace("'@/loading'", "'../loading'"),
      );

      // replace helmet for ssr since @umi@4.0.54
      // ref: https://github.com/umijs/umi/pull/10633
      if (
        api.config.ssr &&
        semver.subset(api.appData.umi.version, '4.0.54 - 4.0.55')
      ) {
        const helmetPath = path.join(api.paths.absTmpPath, 'core/helmet.ts');
        fsExtra.writeFileSync(
          helmetPath,
          fsExtra
            .readFileSync(helmetPath, 'utf-8')
            .replace(
              /(return )(React\.createElement)/,
              "$1typeof window === 'undefined' ? container : $2",
            ),
        );
      }
    },
  });

  // built-in other umi plugins (such as analytics)
  api.registerPlugins([require.resolve('../../compiled/@umijs/plugins')]);

  // FIXME: skip prepare plugin since umi@4.0.48, because it is not compatible with dumi currently
  if (api.isPluginEnable('prepare')) api.skipPlugins(['prepare']);

  // skip routeProps plugin since umi@4.0.53
  // because dumi support conventional route props by default and it will cause ssr failed
  if (api.isPluginEnable('routeProps')) {
    api.skipPlugins(['routeProps']);

    // FIXME: write a empty routeProps file to avoid umi throw error, should be removed after umi fixed
    api.onGenerateFiles({
      // make sure before umi generate files
      stage: -Infinity,
      fn() {
        api.writeTmpFile({
          noPluginDir: true,
          path: 'core/routeProps.js',
          content: 'export default {}',
        });
      },
    });
  }
};
