import type { IApi } from '@/types';
import { deepmerge, winPath } from 'umi/plugin-utils';

/**
 * exclude pre-compiling modules in mfsu mode
 * and make sure there has no multiple instances problem (such as react)
 */
export function safeExcludeInMFSU(api: IApi, excludes: RegExp[]) {
  if (api.userConfig.mfsu !== false) {
    api.modifyDefaultConfig((memo) => {
      memo.mfsu ??= {};
      memo.mfsu.exclude = deepmerge(memo.mfsu.exclude || [], excludes);

      // to avoid multiple instance of react in mfsu mode
      memo.extraBabelIncludes ??= [];
      memo.extraBabelIncludes.push(...excludes);

      return memo;
    });
  }
}

export default (api: IApi) => {
  api.describe({ key: undefined });

  // skip mfsu for client api, to avoid circular resolve in mfsu mode
  safeExcludeInMFSU(api, [new RegExp('dumi/dist/client')]);

  // only normal mode is supported, because src is not fixed in dumi project, eager mode may scan wrong dir
  api.modifyDefaultConfig((memo) => {
    if (api.userConfig.mfsu !== false) {
      memo.mfsu = { strategy: 'normal' };
    }

    return memo;
  });

  // allow import from dumi
  api.modifyConfig((memo) => {
    memo.alias['dumi$'] = '@@/dumi/exports';

    return memo;
  });

  // exports all theme api from dumi
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/exports.ts',
      content: `export * from '../exports.ts';
export * from '${winPath(require.resolve('../client/theme-api'))}';`,
    });
  });
};
