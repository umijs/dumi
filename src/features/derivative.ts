import {
  CLIENT_DEPS,
  LOCAL_DUMI_DIR,
  LOCAL_PAGES_DIR,
  USELESS_TMP_FILES,
} from '@/constants';
import type { IApi } from '@/types';
import { parseModule } from '@umijs/bundler-utils';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { deepmerge, fsExtra, glob, logger, winPath } from 'umi/plugin-utils';

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
 * get files by glob pattern
 */
function getFilesByGlob(globExp: string, dir: string) {
  return glob
    .sync(globExp, { cwd: dir })
    .map((file) => winPath(path.join(dir, file)));
}

/**
 * plugin for derive default behaviors from umi
 */
export default (api: IApi) => {
  const dumiAbsDir = path.join(api.cwd, LOCAL_DUMI_DIR);
  const strategies = {
    // make return value same with umi
    // ref: https://github.com/umijs/umi/blob/9551b4d7832bc30088af75ecea60a0572d8ad767/packages/preset-umi/src/features/appData/appData.ts#L128
    async appJS() {
      const [appJS] = getFilesByGlob('app.{js,jsx,ts,tsx}', dumiAbsDir);

      if (appJS) {
        const [, exports] = await parseModule({
          path: appJS,
          content: fs.readFileSync(appJS, 'utf-8'),
        });

        return {
          path: appJS,
          exports,
        };
      }

      return null;
    },
    globalCSS: getFilesByGlob.bind(
      null,
      'global.{css,less,scss,sass}',
      dumiAbsDir,
    ),
    globalJS: getFilesByGlob.bind(null, 'global.{js,jsx,ts,tsx}', dumiAbsDir),
    overridesCSS: getFilesByGlob.bind(
      null,
      'overrides.{css,less,scss,sass}',
      dumiAbsDir,
    ),
  };

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
  safeExcludeInMFSU(api, [new RegExp('dumi/dist/client')]);

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

  // move all conventional files to .dumi dir
  api.modifyAppData(async (memo) => {
    for (const [key, strategy] of Object.entries(strategies)) {
      memo[key] = await strategy();
    }

    return memo;
  });

  api.register({
    key: 'onGenerateFiles',
    // make sure before umi generate files
    stage: -Infinity,
    async fn() {
      for (const [key, strategy] of Object.entries(strategies)) {
        api.appData[key] = await strategy();
      }
    },
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
