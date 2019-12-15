import fs from 'fs';
import path from 'path';
import { IRoute } from 'umi-types';

const IGNORE_DIR = [
  'node_modules',
];

/**
 * discard .dirname & _dirname
 */
function isValidPath(pathname: string) {
  return !/(^|\/)[._][^\/]+/.test(pathname) && IGNORE_DIR.indexOf(pathname) === -1;
}

/**
 * convert TheComponent to the-component and discard ext
 */
export function filenameToPath(name: string) {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\.\w+$/, '').toLowerCase();
}

/**
 * check the file is default entry
 */
function isDefaultEntry(name: string) {
  return name === 'index' || name === 'readme' || name === 'README';
}

/**
 * find child routes for specific path
 * @param absPath           absolute path
 * @param parentRoutePath   route path that need to join current
 */
function findChildRoutes(absPath: string, parentRoutePath: string = '/'): IRoute[] {
  const mixture = fs.readdirSync(absPath).filter(isValidPath);
  const routes: IRoute[] = [];
  // separate files & child directories
  const [files, dirs] = mixture.reduce((result, item) => {
    if (fs.statSync(path.join(absPath, item)).isDirectory()) {
      result[1].push(item);
    } else {
      result[0].push(item);
    }

    return result;
  }, [[], []]);

  // make sure file is front of child directory in routes
  files.forEach((file) => {
    let routePath = path.join(parentRoutePath, filenameToPath(file))
    const filePath = path.join(absPath, file);
    const fileParsed = path.parse(file);

    switch (fileParsed.ext) {
      case '.md':
        routes.push({
          path: isDefaultEntry(fileParsed.name) ? parentRoutePath : routePath,
          component: filePath,
          exact: true,
          meta: {},
        });
        break;

      default:
    }
  });

  // continue to find child routes
  dirs.forEach((dir) => {
    const dirAbsPath = path.join(absPath, dir);
    const routePath = path.join(parentRoutePath, filenameToPath(dir))

    // only support 2-level routes
    if (parentRoutePath === '/') {
      const childRoutes = findChildRoutes(
        dirAbsPath,
        // nest routes need not to join parent route path, will be process when decorating
        parentRoutePath,
      );

      if (childRoutes.length) {
        const route = { path: routePath, meta: {} };

        // convert root child route to parent route
        if (childRoutes.length === 1 && childRoutes[0].path === '/') {
          Object.assign(route, childRoutes[0], { path: routePath });
        } else {
          Object.assign(route, { routes: childRoutes });
        }

        routes.push(route);
      }
    } else {
      // push child routes to parent level routes if nest over 2-level
      routes.push(...findChildRoutes(
        dirAbsPath,
        routePath,
      ));
    }
  });

  return routes;
}

export default (absPath: string): IRoute[] => {
  const routes = [];

  if (fs.existsSync(absPath)) {
    routes.push(...findChildRoutes(absPath));
  }

  return routes;
};
