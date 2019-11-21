import fs from 'fs';
import path from 'path';
import { IRoute, IApi } from 'umi-types';
import getFrontMatter from './getFrontMatter';

/**
 * discard .dirname & _dirname
 */
function isValidPath(pathname: string) {
  return !/(^|\/)[._][^\/]+/.test(pathname);
}

/**
 * convert TheComponent to the-component and discard ext
 */
export function filenameToPath(name: string) {
  return name.replace( /([a-z])([A-Z])/g, '$1-$2' ).replace(/\.\w+$/, '').toLowerCase();
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
    const routePath = path.join(parentRoutePath, filenameToPath(file))
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

  routes.forEach((route) => {
    const yaml = getFrontMatter(route.component as string);

    if (yaml.title) {
      route.title = yaml.title;
    }
  });

  return routes;
};
