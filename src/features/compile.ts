import type { IDemoLoaderOptions } from '@/loaders/demo';
import type { IMdLoaderOptions } from '@/loaders/markdown';
import ReactTechStack from '@/techStacks/react';
import type { IApi, IDumiTechStack } from '@/types';
import { addExampleAssets } from './assets';

export default (api: IApi) => {
  // register react tech stack by default
  api.register({
    key: 'registerTechStack',
    stage: Infinity,
    fn: () => new ReactTechStack(),
  });

  // allow import from dumi
  api.modifyDefaultConfig((memo) => {
    memo.alias.dumi$ = memo.alias.umi;

    return memo;
  });

  // configure loader to compile markdown
  api.chainWebpack(async (memo) => {
    const babelInUmi = memo.module.rule('src').use('babel-loader').entries();
    const techStacks: IDumiTechStack[] = await api.applyPlugins({
      key: 'registerTechStack',
      type: api.ApplyPluginsType.add,
    });
    const loaderPath = require.resolve('../loaders/markdown');
    const loaderBaseOpts: Partial<IMdLoaderOptions> = {
      techStacks,
      cwd: api.cwd,
      codeBlockMode: api.config.resolve.codeBlockMode,
      extraRemarkPlugins: api.config.extraRemarkPlugins,
      extraRehypePlugins: api.config.extraRehypePlugins,
    };

    memo.module
      .rule('dumi-md')
      .type('javascript/auto')
      .test(/\.md$/)
      // get meta for each markdown file
      .oneOf('md-meta')
      .resourceQuery(/meta$/)
      .use('babel-loader')
      .loader(babelInUmi.loader)
      .options(babelInUmi.options)
      .end()
      .use('md-meta-loader')
      .loader(loaderPath)
      .options({
        ...loaderBaseOpts,
        mode: 'meta',
        onResolveDemos(demos) {
          const assets = demos.reduce<Parameters<typeof addExampleAssets>[0]>(
            (ret, demo) => {
              if ('asset' in demo) ret.push(demo.asset);
              return ret;
            },
            [],
          );

          addExampleAssets(assets);
        },
      } as IMdLoaderOptions)
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
        ...loaderBaseOpts,
        builtins: api.service.themeData.builtins,
        alias: api.config.alias,
      } as IMdLoaderOptions);

    // get meta for each page component
    memo.module
      .rule('dumi-page')
      .type('javascript/auto')
      .test(/\.(j|t)sx?$/)
      .resourceQuery(/meta$/)
      .use('page-meta-loader')
      .loader(require.resolve('../loaders/page'));

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
