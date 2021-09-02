import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import type { IApi, IRoute } from '@umijs/types';
import { createDebug } from '@umijs/utils';
import getRouteConfigFromDir from './getRouteConfigFromDir';
import getTheme from '../theme/loader';
import decorateRoutes from './decorator';
import { prefix } from './decorator/integrate';
import type { IDumiOpts } from '../index';

const debug = createDebug('dumi:routes:get');

export const DUMI_ROOT_FLAG = '__dumiRoot';

export default async (api: IApi, opts: IDumiOpts): Promise<IRoute[]> => {
  const { paths } = api;
  const config: IRoute[] = [];
  const childRoutes: IRoute[] = [];
  const exampleRoutePrefix = opts.mode === 'site' ? '/_' : '/_examples/';
  const theme = await getTheme();
  const userRoutes =
    opts.isIntegrate || api.args?.dumi !== undefined
      ? (
          await api.applyPlugins({
            key: 'dumi.getRootRoute',
            type: api.ApplyPluginsType.modify,
            initialValue: api.userConfig.routes,
          })
        )?.routes
      : api.userConfig.routes;

  if (userRoutes) {
    // only apply user's routes if there has routes config
    childRoutes.push(
      ...userRoutes.map(({ component, ...routeOpts }) => ({
        component: path.isAbsolute(component as string)
          ? slash(path.relative(paths.cwd, component))
          : component,
        ...routeOpts,
      })),
    );
    debug('getRouteConfigFromUserConfig');
  } else {
    // generate routes automatically if there has no routes config
    // find routes from include path & find examples from example path
    opts.resolve.includes.concat(opts.resolve.examples).forEach(item => {
      const docsPath = path.isAbsolute(item) ? item : path.join(paths.cwd, item);

      if (fs.existsSync(docsPath) && fs.statSync(docsPath).isDirectory()) {
        childRoutes.push(...getRouteConfigFromDir(docsPath, opts));
      }
    });
    debug('getRouteConfigFromDir');
  }

  // add main routes
  config.push({
    [DUMI_ROOT_FLAG]: true,
    // use to disable pro-layout in integrated mode
    layout: false,
    path: opts.isIntegrate ? prefix('/') : '/',
    wrappers: [
      // builtin outer layout
      slash(path.relative(api.paths.absPagesPath, path.join(__dirname, '../theme/layout'))),
      // theme layout
      slash(path.relative(api.paths.absPagesPath, theme.layoutPaths._)),
    ],
    // decorate standard umi routes
    routes: decorateRoutes(
      await api.applyPlugins({
        key: 'dumi.beforeDecorateRoutes',
        type: api.ApplyPluginsType.modify,
        initialValue: childRoutes,
      }),
      opts,
      api,
    ),
    title: opts.title,
  });
  debug('decorateRoutes');

  // process example routes
  config[0].routes.forEach(route => {
    if (route.meta?.example) {
      const examplePath = route.path.replace('/', exampleRoutePrefix);

      // add example into top-level routes for external openning
      config.unshift({
        path: examplePath,
        component: route.component,
        title: route.title,
      });

      // use example component as original example component
      route.component = theme.builtins
        .concat(theme.fallbacks)
        .find(i => i.identifier === 'Example').modulePath;
      route.meta.examplePath = examplePath;
    }
  });
  debug('exampleRoutes');

  return config;
};
