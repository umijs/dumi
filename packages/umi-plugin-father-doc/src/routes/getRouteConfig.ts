import fs from 'fs';
import path from 'path';
import { IApi, IRoute } from 'umi-types';
import getFrontMatter from './getFrontMatter';
import getRouteConfigFromDir from './getRouteConfigFromDir';

export default (paths: IApi['paths']): IRoute[] => {
  const config = [{
    path: '/',
    component: path.join(__dirname, '../../src/fixtures/layout.jsx'),
    routes: [],
  }];
  const docsPath = path.join(paths.cwd, 'docs');

  // find routes from docs path
  if (fs.existsSync(docsPath) && fs.statSync(docsPath).isDirectory()) {
    config[0].routes.push(...getRouteConfigFromDir(docsPath));
  }

  // find routes from source path
  config[0].routes.push(...getRouteConfigFromDir(paths.absPagesPath));

  // read yaml config for all routes
  config[0].routes.forEach((route) => {
    route.meta = getFrontMatter(route.component as string);
  });

  return config;
}
