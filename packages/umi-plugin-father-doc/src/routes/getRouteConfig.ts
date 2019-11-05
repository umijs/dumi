import path from 'path';
import { IApi, IRoute } from 'umi-types';
import getRouteConfigFromDir from './getRouteConfigFromDir';

export default (paths: IApi['paths']): IRoute[] => {
  const config = [{
    path: '/',
    component: path.join(__dirname, '../../src/fixtures/layout.jsx'),
    routes: [],
  }];

  config[0].routes = getRouteConfigFromDir(paths);

  return config;
}
