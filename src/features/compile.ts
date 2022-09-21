import type { IDemoLoaderOptions } from '@/loaders/demo';
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
      .rule('dumi-md')
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
      // get page component for each markdown file
      .oneOf('md')
      .use('babel-loader')
      .loader(babelInUmi.loader)
      .options(babelInUmi.options)
      .end()
      .use('md-loader')
      .loader(loaderPath)
      .options({
        techStacks,
        cwd: api.cwd,
        builtins: api.service.themeData.builtins,
      } as IMdLoaderOptions);

    // get pre-transform result for each external demo component
    memo.module
      .rule('dumi-demo')
      .type('javascript/auto')
      .test(/\..+$/)
      .enforce('pre')
      .resourceQuery(/techStack/)
      .use('demo-loader')
      .loader(require.resolve('../loaders/demo'))
      .options({ techStacks, cwd: api.cwd } as IDemoLoaderOptions);

    // get raw content for demo source file
    memo.module
      .rule('dumi-raw')
      .resourceQuery(/raw/)
      .use('raw-loader')
      .loader(require.resolve('raw-loader'));

    // enable fast-refresh for md component in development mode
    if (api.env === 'development') {
      memo.plugin('fastRefresh').tap(([params]) => [
        {
          ...params,
          include: /\.([cm]js|[jt]sx?|flow|md)$/i,
        },
      ]);
    }

    return memo;
  });
};
