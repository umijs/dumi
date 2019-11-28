import fs from 'fs';
import path from 'path';
import { IRoute } from 'umi-types';

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
    let parentPath = parentRoutePath;
    let routePath = path.join(parentPath, filenameToPath(file))
    const filePath = path.join(absPath, file);
    const fileParsed = path.parse(file);
    const firstParentPath = parentPath.split('/')[1];
    const meta: any = {};

    if (firstParentPath) {
      meta.group = { title: firstParentPath, path: `/${firstParentPath}` };

      // discard first parent path then join parent path in getRouteConfig.ts uniformly (for process frontmatter)
      routePath = routePath.replace(meta.group.path, '');
      parentPath = parentPath.replace(meta.group.path, '');
    }

    switch (fileParsed.ext) {
      case '.md':
        routes.push({
          path: fileParsed.name === 'index' ? parentPath : routePath,
          component: filePath,
          exact: true,
          meta,
        });
        break;

      default:
    }
  });

  // continue to find child routes
  dirs.forEach((dir) => {
    const dirAbsPath = path.join(absPath, dir);
    const routePath = path.join(parentRoutePath, filenameToPath(dir))

    routes.push(...findChildRoutes(
      dirAbsPath,
      routePath,
    ))
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
