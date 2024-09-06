import type { IMdLoaderOptions } from '@/loaders/markdown';
import type { IApi } from '@/types';
import fs from 'fs';
import querystring from 'querystring';
import url from 'url';
import { techStacks } from '.';
import { RunLoaderOption, runLoaders } from '../../utils';
import { addAtomMeta, addExampleAssets } from '../assets';
import { shouldDisabledLiveDemo } from './utils';

interface ICustomerRunLoaderInterface extends RunLoaderOption {
  type?: 'css' | 'js' | 'jsx';
}

type QueryType = 'demo-index' | 'frontmatter' | 'text' | 'demo';

const modeMap: Record<QueryType, string> = {
  'demo-index': 'demo-index',
  frontmatter: 'frontmatter',
  text: 'text',
  demo: 'demo',
};

const customRunLoaders = async (options: ICustomerRunLoaderInterface) => {
  const result = await runLoaders(options);
  return {
    content: result.result![0],
    type: options.type ?? 'jsx',
  };
};

const mdLoaderPath = require.resolve('../../loaders/markdown');

export const getLoadHook = (api: IApi) => {
  const disableLiveDemo = shouldDisabledLiveDemo(api);
  return async (filePath: string) => {
    const loaderBaseOpts: Partial<IMdLoaderOptions> = {
      techStacks,
      cwd: api.cwd,
      alias: api.config.alias,
      resolve: api.config.resolve,
      extraRemarkPlugins: api.config.extraRemarkPlugins,
      extraRehypePlugins: api.config.extraRehypePlugins,
      routes: api.appData.routes,
      locales: api.config.locales || [],
      pkg: api.pkg,
      disableLiveDemo,
    };

    const requestUrl = url.parse(filePath);
    const query = querystring.parse(requestUrl.query!);
    if (requestUrl.query?.includes('watch=parent')) {
      return {
        content: '',
        type: 'js',
      };
    }
    if (/\..+$/.test(filePath)) {
      if (requestUrl.query?.includes('techStack')) {
        return await customRunLoaders({
          resource: filePath,
          loaders: [
            {
              loader: require.resolve('../../loaders/demo'),
              options: { techStacks, cwd: api.cwd },
            },
          ],
        });
      }
    }
    if (/\.(j|t)sx?\?type=frontmatter$/.test(filePath)) {
      return await customRunLoaders({
        resource: filePath,
        loaders: [
          {
            loader: require.resolve('../../loaders/page'),
            options: {},
          },
        ],
      });
    }

    if (requestUrl.pathname?.endsWith('.md')) {
      let options;

      const builtins = api.service.themeData.builtins;
      const baseOptions = { ...loaderBaseOpts };
      const resolveOptions = (queryType: QueryType) => {
        if (queryType in modeMap) {
          return { ...baseOptions, mode: modeMap[queryType] };
        }

        const additionalOpts = (
          api.isPluginEnable('assets') || api.isPluginEnable('exportStatic')
            ? {
                builtins,
                onResolveDemos(demos) {
                  const assets = demos.reduce<
                    Parameters<typeof addExampleAssets>[0]
                  >(
                    (acc, demo) =>
                      'asset' in demo ? [...acc, demo.asset] : acc,
                    [],
                  );
                  addExampleAssets(assets);
                },
                onResolveAtomMeta: addAtomMeta,
              }
            : { builtins }
        ) as IMdLoaderOptions;

        return { ...baseOptions, ...additionalOpts };
      };

      options = resolveOptions(query.type as QueryType);
      return await customRunLoaders({
        resource: filePath,
        loaders: [
          {
            loader: mdLoaderPath,
            options,
          },
        ],
        context: {},
        readResource: fs.readFile.bind(fs),
      });
    }
    if (requestUrl.query?.includes('dumi-raw')) {
      return await customRunLoaders({
        resource: filePath,
        loaders: [
          {
            loader: require.resolve('../../loaders/post-raw'),
            options: {},
          },
          {
            loader: require.resolve('raw-loader'),
            options: {},
          },
          {
            loader: require.resolve('../../loaders/pre-raw'),
            options: {},
          },
        ],
      });
    }
  };
};
