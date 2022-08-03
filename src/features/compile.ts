import type { IApi } from '@/types';

export default (api: IApi) => {
  api.chainWebpack((memo) => {
    const babelInUmi = memo.module.rule('src').use('babel-loader').entries();

    memo.module
      .rule('dumi-md')
      .type('javascript/auto')
      .test(/\.md$/)
      .use('babel-loader')
      .loader(babelInUmi.loader)
      .options(babelInUmi.options)
      .end()
      .use('dumi-md-loader')
      .loader(require.resolve('../loaders/markdown'));

    return memo;
  });
};
