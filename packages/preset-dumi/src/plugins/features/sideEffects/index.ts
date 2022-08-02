import type { IApi } from '@umijs/types';
import path from 'path';
import docSideEffectsWebpackPlugin from './docSideEffectsWebpackPlugin';

/**
 * plugin for register a webpack plugin, to avoid tree-shaking for .umi directory if package.json has sideEffects: false
 * because dumi may care some umi runtime plugins, such as .umi/plugin-qiankun
 */
export default (api: IApi) => {
  api.chainWebpack(memo => {
    memo
      .plugin('docSideEffects')
      .use(docSideEffectsWebpackPlugin, [
        {
          sideEffects: [
            // such as src/.umi-production/**
            api.utils.winPath(path.relative(api.cwd, path.join(api.paths.absTmpPath, '**'))),
            // .dumi local theme
            '.dumi/theme/**',
          ],
          pkgPath: path.join(api.cwd, 'package.json'),
        },
      ]);

    return memo;
  });
};
