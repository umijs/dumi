import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import { IRoute } from 'umi-types';
import { IFatherDocOpts } from '../index';

const IGNORE_DIR = ['node_modules'];

/**
 * discard .dirname & _dirname & ignore directories
 */
function isValidPath(pathname: string) {
  return !/(^|\/)[._][^/]+/.test(pathname) && IGNORE_DIR.indexOf(pathname) === -1;
}

/**
 * normalize file path to route path
 * @param oPath       original file path
 * @param localePath  locale path (optional)
 */
function normalizePath(oPath: string, localePath: string = '') {
  return slash(path.join(
    localePath,
    oPath
      // discard filename for the default entries (index.md, README.md)
      .replace(/(index|readme)$/i, '')
      // convert TheComponent to the-component
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase(),
  )).replace(/([^]+)\/$/, '$1'); // discard end slashZ
}

function splitLocalePathFromFilename(filename: string, locales: IFatherDocOpts['locales']) {
  const matchs = filename.match(/^(.+)\.([^.]+)$/);
  const result: [string, string] = ['', filename];

  if (matchs) {
    const locale = locales.find(([name]) => name === matchs[2]);

    // set locale path if there has locale config & it is not the default locale
    if (locale && locales.indexOf(locale) > 0) {
      result[0] = `/${locale[0]}`; // locale path
    }

    result[1] = matchs[1]; // real filename
  }

  return result;
}

/**
 * find child routes for specific path
 * @param absPath           absolute path
 * @param opts              father-doc options
 * @param parentRoutePath   route path that need prefix for current
 */
function findChildRoutes(absPath: string, opts: IFatherDocOpts, parentRoutePath: string = '/'): IRoute[] {
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
    const [localePath, realFilename] = splitLocalePathFromFilename(fileParsed.name, opts.locales);
    const routePath = path.join(parentRoutePath, realFilename);
    const filePath = path.join(absPath, file);

    switch (fileParsed.ext) {
      case '.md':
        routes.push({
          path: normalizePath(routePath, localePath),
          component: `./${slash(path.relative(process.cwd(), filePath))}`,
          exact: true,
        });
        break;

      default:
    }
  });

  // continue to find child routes
  dirs.forEach(dir => {
    routes.push(...findChildRoutes(path.join(absPath, dir), opts, path.join(parentRoutePath, dir)));
  });

  return routes;
}

export default (absPath: string, opts: IFatherDocOpts): IRoute[] => {
  const routes = [];

  if (fs.existsSync(absPath)) {
    routes.push(...findChildRoutes(absPath, opts));
  }

  return routes;
};
