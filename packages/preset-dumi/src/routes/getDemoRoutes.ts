import path from 'path';
import { IRoute, IApi } from '@umijs/types';
import { normalizePath } from './getRouteConfigFromDir';

let singleRouteDemoSet: { [key: string]: string } = {};
let demoPathNames: { [key: string]: number } = {};

export function addDemoRoute(filePath: string): string {
  const demoPathName = normalizePath(path.parse(filePath).name);

  if (!singleRouteDemoSet[filePath]) {
    singleRouteDemoSet[filePath] = `/_demos/${demoPathName}${
      // handle same demo name files
      demoPathNames[demoPathName] ? `-${demoPathNames[demoPathName]}` : ''
    }`;
    demoPathNames[demoPathName] = (demoPathNames[demoPathName] || 0) + 1;
  }

  return singleRouteDemoSet[filePath];
}

export function clearDemoRoutes() {
  singleRouteDemoSet = {};
  demoPathNames = {};
}

export default (paths: IApi['paths']): IRoute[] => {
  return Object.entries(singleRouteDemoSet).map(([filePath, routePathName]) => ({
    path: routePathName,
    component: path.relative(path.join(paths.absTmpPath, 'core'), path.join(paths.cwd, filePath)),
  }));
};
