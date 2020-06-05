import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import { IApi, IRoute } from '@umijs/types';
import getRouteConfigFromDir from './getRouteConfigFromDir';
import decorateRoutes from './decorator';
import { IDumiOpts } from '../index';

export default (api: IApi, opts: IDumiOpts): IRoute[] => {
  const { paths } = api;
  const config: IRoute[] = [];
  const childRoutes: IRoute[] = [];
  const exampleRoutePrefix = opts.mode === 'site' ? '/_' : '/_examples/';

  if (opts.routes) {
    // only apply user's routes if there has routes config
    childRoutes.push(
      ...opts.routes.map(({ component, ...routeOpts }) => ({
        component: path.isAbsolute(component as string)
          ? slash(path.relative(paths.cwd, component))
          : component,
        ...routeOpts,
      })),
    );
  } else {
    // generate routes automatically if there has no routes config
    // find routes from include path & find examples from example path
    opts.resolve.includes.concat(opts.resolve.examples).forEach(item => {
      const docsPath = path.isAbsolute(item) ? item : path.join(paths.cwd, item);

      if (fs.existsSync(docsPath) && fs.statSync(docsPath).isDirectory()) {
        childRoutes.push(...getRouteConfigFromDir(docsPath, opts));
      }
    });
  }

  // add main routes
  config.push({
    path: '/',
    component: slash(
      path.relative(
        path.join(paths.absTmpPath, 'core'),
        path.join(__dirname, '../themes/default/layout.js'),
      ),
    ),
    // decorate standard umi routes
    routes: decorateRoutes(childRoutes, opts, api),
    title: opts.title,
  });

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
      route.component = path.relative(
        path.join(paths.absTmpPath, 'core'),
        path.join(__dirname, '../themes/default/builtins/Example.js'),
      );
      route.meta.examplePath = examplePath;
    }
  });

  return config;
};
