import { CLIENT_DEPS, LOCAL_PAGES_DIR, USELESS_TMP_FILES } from '@/constants';
import type { IApi } from '@/types';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { deepmerge, fsExtra, logger, winPath } from 'umi/plugin-utils';

/**
 * exclude pre-compiling modules in mfsu mode
 * and make sure there has no multiple instances problem (such as react)
 */
export function safeExcludeInMFSU(api: IApi, excludes: RegExp[]) {
  if (api.userConfig.mfsu !== false) {
    api.modifyDefaultConfig((memo) => {
      if (memo.mfsu === false) return memo;

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
      api.config.mfsu?.strategy !== 'eager',
      'MFSU eager mode is not supported yet!',
    );
    assert(
      !api.config.ssr || api.config.ssr.builder === 'webpack',
      'Only `webpack` builder is supported in SSR mode!',
    );
    if (api.userConfig.history?.type === 'hash') {
      logger.warn(
        'Hash history is temporarily incompatible, it is recommended to use browser history for now.',
      );
    }
  });

  // skip mfsu for client api, to avoid circular resolve in mfsu mode
  safeExcludeInMFSU(api, [
    new RegExp('dumi/dist/client'),
    // for useSiteSearch api
    new RegExp('compiled/_internal/searchWorker'),
  ]);

  api.modifyDefaultConfig((memo) => {
    if (api.userConfig.mfsu !== false) {
      if (
        fs.existsSync(path.join(api.cwd, 'node_modules', '.pnpm')) ||
        process.platform === 'win32'
      ) {
        // FIXME: mfsu compatibility for pnpm and windows
        // mfsu normal model will broken in pnpm mode, because dumi exclude client
        // files in mfsu mode and umi cannot resolve nested deps from dumi client
        // and mfsu will broken on window platform with unknown reason
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

        // alias all client dependencies, to make sure normal mfsu can resolve them, until umi fixed
        // ref: https://github.com/umijs/umi/blob/de59054b2afe6ba92d0b52b530d71612ac4055a8/packages/mfsu/src/dep/dep.ts#L91-L92
        CLIENT_DEPS.forEach((pkg) => {
          memo.alias ??= {};
          memo.alias[pkg] = winPath(
            path.dirname(require.resolve(`${pkg}/package.json`)),
          );
        });
      }
    }

    // enable conventional routes
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
      memo['@'] = api.userConfig.alias['@'];
    } else {
      // fallback to use src as @ first, like Umi
      memo['@'] = winPath(
        [path.join(api.cwd, 'src'), api.cwd].find(fs.existsSync)!,
      );
    }

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
};
