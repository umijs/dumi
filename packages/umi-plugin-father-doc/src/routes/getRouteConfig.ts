import fs from 'fs';
import path from 'path';
import { IApi, IRoute } from 'umi-types';
import getRouteConfigFromDir from './getRouteConfigFromDir';

export default (paths: IApi['paths']): IRoute[] => {
  const config = [{
    path: '/',
    component: path.join(__dirname, '../../src/fixtures/layout.jsx'),
    routes: getRouteConfigFromDir(paths.absPagesPath),
  }];
  const docsPath = path.join(paths.cwd, 'docs');

  if (fs.existsSync(docsPath) && fs.statSync(docsPath).isDirectory()) {
    config[0].routes.push(...getRouteConfigFromDir(docsPath));
  }

  return config;
}
