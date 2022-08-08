import ReactTechStack from '@/techStacks/react';
import type { IApi } from '@/types';

export default (api: IApi) => {
  // register react tech stack by default
  api.registerTechStack(() => new ReactTechStack());

  // configure loader to compile markdown
  api.chainWebpack(async (memo) => {
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
