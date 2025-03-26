import type { IDemoLoaderOptions } from '@/loaders/demo';
import type { IMdLoaderOptions } from '@/loaders/markdown';
import ReactTechStack from '@/techStacks/react';
import type { IApi, IDumiTechStack } from '@/types';
import { _setFSCacheDir } from '@/utils';
import fs from 'fs';
import path from 'path';
import { addAtomMeta, addExampleAssets } from '../assets';
import { getLoadHook } from './makoHooks';
import { shouldDisabledLiveDemo } from './utils';
export const techStacks: IDumiTechStack[] = [];
export default (api: IApi) => {
  api.describe({ key: 'dumi:compile' });

  // register react tech stack by default
  api.register({
    key: 'registerTechStack',
    stage: Infinity,
    fn: () => new ReactTechStack(),
  });

  api.modifyConfig({
    stage: Infinity,
    fn: (memo) => {
      // add customize option for babel-loader, to avoid collect wrong deps result in MFSU
      if (memo.babelLoaderCustomize) {
        api.logger.warn(
          'Config `babelLoaderCustomize` will be override by dumi, please report issue if you need it.',
        );
      }

      memo.babelLoaderCustomize = require.resolve('./babelLoaderCustomize');

      // configure dumi fs cache dir
      const cacheDirPath =
        api.userConfig.cacheDirectoryPath || memo.cacheDirectoryPath;

      if (cacheDirPath) _setFSCacheDir(path.join(cacheDirPath, 'dumi'));

      // inject raw code to use search worker in inline mode
      const SEARCH_WORKER_CODE = fs.readFileSync(
        path.resolve(
          __dirname,
          '../../../compiled/_internal/searchWorker.min.js',
        ),
        'utf-8',
      );
      memo.define ??= {};
      memo.define.SEARCH_WORKER_CODE = SEARCH_WORKER_CODE;

      return memo;
    },
  });

  api.onGenerateFiles({
    // make sure called before `addRuntimePlugin` key
    // why not use `before: 'tmpFiles'`?
    // because @umijs/preset-umi/.../tmpFiles has two `onGenerateFiles` key
    // and `before` only insert before the last one
    stage: -Infinity,
    async fn() {
      techStacks.push(
        ...(await api.applyPlugins({
          key: 'registerTechStack',
          type: api.ApplyPluginsType.add,
        })),
      );
    },
  });

  // auto register runtime plugin for each tech stack
  api.addRuntimePlugin(() =>
    techStacks.reduce<string[]>((acc, techStack) => {
      if (techStack.runtimeOpts?.pluginPath) {
        acc.push(techStack.runtimeOpts.pluginPath);
      }

      return acc;
    }, []),
  );

  // configure loader to compile markdown
  api.modifyConfig((memo) => {
    memo.mfsu = false;
    return memo;
  });
  api.chainWebpack(async (memo) => {
    const babelInUmi = memo.module.rule('src').use('babel-loader').entries();
    if (!babelInUmi) return memo;
    const loaderPath = require.resolve('../../loaders/markdown');
    const loaderBaseOpts: Partial<IMdLoaderOptions> = {
      techStacks,
      cwd: api.cwd,
      alias: api.config.alias,
      resolve: api.config.resolve,
      extraRemarkPlugins: api.config.extraRemarkPlugins,
      extraRehypePlugins: api.config.extraRehypePlugins,
      routes: api.appData.routes,
      locales: api.config.locales,
      pkg: api.pkg,
      disableLiveDemo: shouldDisabledLiveDemo(api),
    };
    memo.module
      .rule('watch-parent')
      .pre()
      .resourceQuery(/watch=parent/)
      .use('null-loader')
      .loader(require.resolve('../../loaders/null'))
      .end();
    const mdRule = memo.module
      .rule('dumi-md')
      .type('javascript/auto')
      .test(/\.md$/);

    // generate independent oneOf rules
    ['frontmatter', 'text', 'demo-index'].forEach((type) => {
      mdRule
        .oneOf(`md-${type}`)
        .resourceQuery(new RegExp(`${type}$`))
        .use(`md-${type}-loader`)
        .loader(loaderPath)
        .options({
          ...loaderBaseOpts,
          mode: type,
        });
    });

    // get demo metadata for each markdown file
    mdRule
      .oneOf('md-demo')
      .resourceQuery(/demo$/)
      .use('babel-loader')
      .loader(babelInUmi.loader)
      .options(babelInUmi.options)
      .end()
      .use('md-demo-loader')
      .loader(loaderPath)
      .options({
        ...loaderBaseOpts,
        mode: 'demo',
      })
      .end()
      .end();

    // get page component for each markdown file
    mdRule
      .oneOf('md')
      .use('babel-loader')
      .loader(babelInUmi.loader)
      .options(babelInUmi.options)
      .end()
      .use('md-loader')
      .loader(loaderPath)
      .options(
        (api.isPluginEnable('assets') || api.isPluginEnable('exportStatic')
          ? {
              ...loaderBaseOpts,
              builtins: api.service.themeData.builtins,
              onResolveDemos(demos) {
                const assets = demos.reduce<
                  Parameters<typeof addExampleAssets>[0]
                >((ret, demo) => {
                  if ('asset' in demo) ret.push(demo.asset);
                  return ret;
                }, []);

                addExampleAssets(assets);
              },
              onResolveAtomMeta: addAtomMeta,
            }
          : {
              ...loaderBaseOpts,
              builtins: api.service.themeData.builtins,
            }) as IMdLoaderOptions,
      );

    // get meta for each page component
    memo.module
      .rule('dumi-page')
      .type('javascript/auto')
      .test(/\.(j|t)sx?$/)
      .resourceQuery(/frontmatter$/)
      .use('page-meta-loader')
      .loader(require.resolve('../../loaders/page'));

    // get pre-transform result for each external demo component
    memo.module
      .rule('dumi-demo')
      .type('javascript/auto')
      .test(/\..+$/)
      .enforce('pre')
      .resourceQuery(/techStack/)
      .use('demo-loader')
      .loader(require.resolve('../../loaders/demo'))
      .options({ techStacks, cwd: api.cwd } as IDemoLoaderOptions);

    // get raw content for demo source file
    memo.module
      .rule('dumi-raw')
      .type('javascript/auto')
      .post()
      .resourceQuery(/dumi-raw/)
      .use('raw-loader')
      .loader(require.resolve('raw-loader'))
      .end()
      .use('pre-raw-loader')
      .loader(require.resolve('../../loaders/pre-raw'));

    // enable fast-refresh for md component in development mode
    if (api.env === 'development' && memo.plugins.has('fastRefresh')) {
      memo.plugin('fastRefresh').tap(([params]) => [
        {
          ...params,
          include: /\.([cm]js|[jt]sx?|flow|md)$/i,
        },
      ]);
    }
    return memo;
  });

  api.modifyConfig({
    before: 'mako',
    fn: (memo) => {
      if (memo.mako || memo.ssr?.builder === 'mako') {
        memo.mako ??= {};
        memo.mako.plugins = [
          {
            load: getLoadHook(api),
          },
        ];
      }
      return memo;
    },
  });
};
