import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import type { IRoute } from '@umijs/types';
import ignore from 'ignore';

import type { IDumiOpts } from '../index';
import ctx from '../context';

const IGNORE_DIR = ['node_modules', 'fixtures'];

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
 * @param locales     current locale options (optional)
 */
export function normalizePath(
  oPath: string,
  localePath: string = '',
  locales: IDumiOpts['locales'] = [],
) {
  return slash(
    path.join(
      localePath,
      slash(oPath)
        // discard filename for the default entries (index, README.zh-CN)
        .replace(
          new RegExp(`/(index|readme)(\\.(${locales.map(([name]) => name).join('|')}))?$`, 'i'),
          '/',
        )
        // convert TheComponent to the-component
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase(),
    ),
  ).replace(/([^]+)\/$/, '$1'); // discard end slashZ
}

function splitLocalePathFromFilename(filename: string, locales: IDumiOpts['locales']) {
  const matchList = filename.match(/^(.+)\.([^.]+)$/);
  const result: [string, string] = ['', filename];

  if (matchList) {
    const locale = locales.find(([name]) => name === matchList[2]);

    // set locale path if there has locale config & it is not the default locale
    if (locale && locales.indexOf(locale) > 0) {
      result[0] = `/${locale[0]}`; // locale path
    }

    // eslint-disable-next-line prefer-destructuring
    result[1] = matchList[1]; // real filename
  }

  return result;
}

/**
 * find child routes for specific path
 * @param absPath           absolute path
 * @param opts              dumi options
 * @param parentRoutePath   route path that need prefix for current
 */
function findChildRoutes(
  absPath: string,
  opts: IDumiOpts,
  parentRoutePath: string = '/',
): IRoute[] {
  const cwd = ctx.umi?.cwd || process.cwd();
  const isExampleDir = opts.resolve?.examples?.some(dir => path.join(cwd, dir) === absPath);
  let mixture = fs.readdirSync(absPath).filter(isValidPath);
  if (opts.resolve?.excludes?.length) {
    const ig = ignore().add(opts.resolve.excludes);
    mixture = mixture.filter(filename => {
      const absoluteFilepath = path.join(absPath, filename);
      const filepath = slash(path.relative(cwd, absoluteFilepath));
      return !ig.ignores(filepath);
    });
  }
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
    const filePath = path.join(absPath, file);
    const isRcFile = ['.tsx', '.jsx'].includes(fileParsed.ext);
    const isExample = isExampleDir && isRcFile;
    let routePath = path.join(parentRoutePath, realFilename);

    // collect all examples under examples dir path in site mode
    if (isExampleDir && opts.mode === 'site') {
      routePath = path.join('/', path.parse(absPath).name, routePath);
    }

    if (
      // process markdown file always
      fileParsed.ext === '.md' ||
      // process React Component if search in example directory
      (isRcFile && isExampleDir)
    ) {
      const route: IRoute = {
        path: normalizePath(routePath, localePath, opts.locales),
        component: `./${slash(path.relative(cwd, filePath))}`,
        exact: true,
      };

      // add example flag
      if (isExample) {
        route.meta = { example: true };
      }

      routes.push(route);
    }
  });

  // continue to find child routes for non-example directory
  if (!isExampleDir) {
    dirs.forEach(dir => {
      routes.push(
        ...findChildRoutes(path.join(absPath, dir), opts, path.join(parentRoutePath, dir)),
      );
    });
  }

  return routes;
}

export default (absPath: string, opts: IDumiOpts): IRoute[] => {
  const routes = [];
  if (fs.existsSync(absPath)) {
    routes.push(...findChildRoutes(absPath, opts));
  }

  return routes;
};
