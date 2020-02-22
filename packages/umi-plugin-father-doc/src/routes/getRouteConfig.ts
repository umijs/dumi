import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import { IApi, IRoute } from '@umijs/types';
import getRouteConfigFromDir from './getRouteConfigFromDir';
import decorateRoutes from './decorator';
import { IFatherDocOpts } from '../index';

export default (api: IApi, opts: IFatherDocOpts): IRoute[] => {
  const config = [
    {
      path: '/',
      component: slash(path.join(__dirname, '../themes/default/layout.js')),
      routes: [],
      title: opts.title,
    },
  ];
  const { paths } = api;

  if (opts.routes) {
    // only apply user's routes if there has routes config
    config[0].routes = opts.routes.map(({ component, ...routeOpts }) => ({
      component: path.isAbsolute(component as string)
        ? component
        : slash(path.join(paths.absPagesPath, component as string)),
      ...routeOpts,
    }));
  } else {
    // generate routes automatically if there has no routes config
    // find routes from include path
    opts.include.forEach(item => {
      const docsPath = path.isAbsolute(item) ? item : path.join(paths.cwd, item);

      if (fs.existsSync(docsPath) && fs.statSync(docsPath).isDirectory()) {
        config[0].routes.push(...getRouteConfigFromDir(docsPath, opts));
      }
    });
  }

  // decorate standard umi routes
  config[0].routes = decorateRoutes(config[0].routes, opts, api);

  return config;
};
