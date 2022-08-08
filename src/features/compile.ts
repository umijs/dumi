import type { IMdLoaderOptions } from '@/loaders/markdown';
import ReactTechStack from '@/techStacks/react';
import type { IApi, IDumiTechStack } from '@/types';

export default (api: IApi) => {
  // register react tech stack by default
  api.registerTechStack(() => new ReactTechStack());

  // configure loader to compile markdown
  api.chainWebpack(async (memo) => {
    const loaderPath = require.resolve('../loaders/markdown');
    const babelInUmi = memo.module.rule('src').use('babel-loader').entries();
    const techStacks: IDumiTechStack[] = await api.applyPlugins({
      key: 'registerTechStack',
      type: api.ApplyPluginsType.add,
    });

    memo.module
      .rule('dumi')
      .type('javascript/auto')
      .test(/\.md$/)
      // get demo index for each markdown file
      .oneOf('demo-index')
      .resourceQuery(/meta\.demos/)
      .use('demo-index-loader')
      .loader(loaderPath)
      .options({ techStacks, cwd: api.cwd, mode: 'demos' } as IMdLoaderOptions)
      .end()
      .end()
      // get demo component for each markdown file
      .oneOf('md')
      .use('babel-loader')
      .loader(babelInUmi.loader)
      .options(babelInUmi.options)
      .end()
      .use('md-loader')
      .loader(loaderPath)
      .options({ techStacks, cwd: api.cwd } as IMdLoaderOptions);

    return memo;
  });
};
