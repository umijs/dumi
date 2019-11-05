import fs from 'fs';
import path from 'path';
import { IRoute, IApi } from 'umi-types';
import distComponentFromRoutes from './distComponentFromRoutes';

/**
 * discard .dirname & _dirname
 */
function isValidPath(pathname: string) {
  return !/(^|\/)[._][^\/]+/.test(pathname);
}

/**
 * convert TheComponent to the-component
 */
function camelCase2Hyphenated(name: string) {
  return name.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}

/**
 * find child routes for specific path
 * @param absPath           absolute path
 * @param parentRoutePath   route path that need to join current
 */
function findChildRoutes(absPath: string, parentRoutePath: string = '/'): IRoute[] {
  const files = fs.readdirSync(absPath).filter(isValidPath);
  const routes: IRoute[] = [];

  files.forEach((file) => {
    const filePath = path.join(absPath, file);
    const routePath = path.join(parentRoutePath, camelCase2Hyphenated(file))
    const fileParsed = path.parse(file);

    if (fs.statSync(filePath).isDirectory()) {
      // continue to find child routes
      routes.push(...findChildRoutes(
        filePath,
        routePath,
      ))
    } else if (fileParsed.ext === '.md') {
      // add route if there has .md file
      routes.push({
        path: fileParsed.name === 'index' ? parentRoutePath : routePath,
        component: filePath,
        exact: true,
      });
    }
  });

  return routes;
}

export default (paths: IApi['paths']): IRoute[] => {
  const routes = findChildRoutes(paths.absPagesPath);

  distComponentFromRoutes(paths, routes);

  return routes;
};
