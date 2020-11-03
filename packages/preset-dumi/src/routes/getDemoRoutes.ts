import path from 'path';
import { IRoute, IApi } from '@umijs/types';
import slash from 'slash2';
import { normalizePath } from './getRouteConfigFromDir';

const singleRouteDemoSet: { [key: string]: string } = {};
const demoPathNames: { [key: string]: number } = {};

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

export default (paths: IApi['paths']): IRoute[] =>
  Object.entries(singleRouteDemoSet).map(([filePath, routePathName]) => ({
    path: routePathName,
    component: slash(path.relative(path.join(paths.absTmpPath, 'core'), filePath)),
  }));
