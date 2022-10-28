import path from 'path';
import type { IApi } from 'umi';
import { winPath } from 'umi/plugin-utils';
import docSideEffectsWebpackPlugin from './docSideEffectsWebpackPlugin';

/**
 * plugin for register the doc side-effects webpack plugin
 * to avoid tree-shaking for .umi & .dumi/theme directory if package.json has sideEffects: false
 */
export default (api: IApi) => {
  api.describe({ key: 'dumi:sideEffects' });

  api.chainWebpack((memo) => {
    memo.plugin('docSideEffects').use(docSideEffectsWebpackPlugin, [
      {
        sideEffects: [
          // such as .dumi/tmp-production/**
          winPath(
            path.relative(api.cwd, path.join(api.paths.absTmpPath, '**')),
          ),
          // .dumi local theme
          '.dumi/theme/**',
        ],
        pkgPath: path.join(api.cwd, 'package.json'),
      },
    ]);

    return memo;
  });
};
