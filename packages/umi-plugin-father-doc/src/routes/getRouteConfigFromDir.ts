import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import { IRoute } from 'umi-types';

const IGNORE_DIR = ['node_modules'];

/**
 * discard .dirname & _dirname & ignore directories
 */
function isValidPath(pathname: string) {
  return !/(^|\/)[._][^/]+/.test(pathname) && IGNORE_DIR.indexOf(pathname) === -1;
}

/**
 * normalize file path to route path
 * @param path  original file path
 */
function normalizePath(path: string) {
  return slash(path)
    // discard filename for the default entries (index.md, README.md)
    .replace(/(index|readme)$/i, '')
    // convert TheComponent to the-component
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    // discard end slash
    .replace(/([^]+)\/$/, '$1');
}

/**
 * find child routes for specific path
 * @param absPath           absolute path
 * @param parentRoutePath   route path that need prefix for current
 */
function findChildRoutes(absPath: string, parentRoutePath: string = '/'): IRoute[] {
  const mixture = fs.readdirSync(absPath).filter(isValidPath);
  const routes: IRoute[] = [];
  // separate files & child directories
  const [files, dirs] = mixture.reduce(
    (result, item) => {
      if (fs.statSync(path.join(absPath, item)).isDirectory()) {
        result[1].push(item);
      } else {
        result[0].push(item);
      }

      return result;
    },
    [[], []],
  );

  // make sure file is front of child directory in routes
  files.forEach(file => {
    const fileParsed = path.parse(file);
    const routePath = path.join(parentRoutePath, fileParsed.name);
    const filePath = path.join(absPath, file);

    switch (fileParsed.ext) {
      case '.md':
        routes.push({
          path: normalizePath(routePath),
          component: `./${slash(path.relative(process.cwd(), filePath))}`,
          exact: true,
        });
        break;

      default:
    }
  });

  // continue to find child routes
  dirs.forEach(dir => {
    routes.push(...findChildRoutes(path.join(absPath, dir), path.join(parentRoutePath, dir)));
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
