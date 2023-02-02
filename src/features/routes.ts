import { SP_ROUTE_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import { getConventionRoutes } from '@umijs/core';
import { createRouteId } from '@umijs/core/dist/route/utils';
import path from 'path';
import { plural } from 'pluralize';
import type { IRoute } from 'umi';
import { glob, resolve, winPath } from 'umi/plugin-utils';

const CTX_LAYOUT_ID = 'dumi-context-layout';

/**
 * normalize item of `resolve.docDirs` to object
 */
function normalizeDocDir(docDir: IApi['config']['resolve']['docDirs'][0]) {
  return typeof docDir === 'object' ? docDir : { dir: docDir };
}

/**
 * make route path kebab case
 */
function kebabCaseRoutePath(routePath: string) {
  const replacer = (_: string, s1: string, s2: string, i: number) => {
    const symbol = ['', '/'].includes(s1) || !i ? '' : '-';

    return `${s1 || ''}${symbol}${s2.toLowerCase()}`;
  };

  return (
    routePath
      // kebab for normal word
      .replace(/(.)?([A-Z][^A-Z/])/g, replacer)
      // kebab for upper word
      .replace(/(.)?([A-Z]+)/g, replacer)
  );
}

/**
 * localize standard umi route path by locales config
 */
function localizeUmiRoute(
  route: IRoute,
  locales: IApi['config']['locales'],
  forceKebabCase: boolean,
) {
  const locale = locales.find(
    (locale) =>
      route.path.endsWith(`/${locale.id}`) &&
      // avoid locale id conflict with folder/file name
      path.parse(route.file).name.endsWith(`.${locale.id}`),
  );
  const format = forceKebabCase ? kebabCaseRoutePath : (str: string) => str;

  if (locale) {
    // strip single `/` locale base or move `/` to the end of locale base for join
    const base =
      !('base' in locale) || locale.base === '/'
        ? ''
        : locale.base!.replace(/^(\/)(.+)$/, '$2$1');
    // prepare suffix for join
    const suffix = 'suffix' in locale ? locale.suffix : '';
    // /foo/zh-CN => /{prefix}/foo
    // /bar/index/zh-CN => /{prefix}/bar
    route.path = `${base}${format(
      route.path
        .replace(new RegExp(`/${locale.id}$`), '')
        .replace(/((^|\/)(index|README))$/, ''),
    )}${suffix}`;
    route.absPath = route.path !== '/' ? `/${route.path}` : route.path;
  } else {
    // also kebab-case for non-locale route
    route.path = format(route.path);
    route.absPath = format(route.absPath);
  }
}

/**
 * make nested doc route be flat
 */
function flatRoute(route: IRoute, docLayoutId: string) {
  if (route.parentId !== docLayoutId) {
    route.parentId = docLayoutId;
    route.path =
      route.path === '*'
        ? // FIXME: compatible with wrong conventional 404 absPath, wait for umi fix
          // from: https://github.com/umijs/umi/blob/9e8f143229d6f5d8547e951c23cbb2c66cbfd190/packages/preset-umi/src/features/404/404.ts#L8
          route.path
        : route.absPath.slice(1);
  }
}

/**
 * get page route file
 */
function getClientPageFile(file: string, cwd: string) {
  let clientFile: string;

  try {
    // why use `resolve`?
    // because `require.resolve` will use the final path of symlink file
    // and in tnpm project, umi will get a file path includes `@` symbol then
    // generate a chunk name with `@` symbol, which is not supported by cdn
    clientFile = resolve.sync(`dumi/dist/${file}`, {
      basedir: cwd,
      preserveSymlinks: false,
    });
  } catch {
    // fallback to use `require.resolve`, for dumi self docs & examples
    clientFile = require.resolve(`../${file}`);
  }

  return winPath(clientFile);
}

export default (api: IApi) => {
  const extraWatchPaths = [
    ...(api.userConfig.resolve?.atomDirs || []),
    ...(api.userConfig.resolve?.docDirs?.map(normalizeDocDir) || [
      { dir: 'docs' },
    ]),
  ].map(({ dir }) => path.join(api.cwd, dir, '**/*.md'));

  api.describe({ key: 'dumi:routes' });

  // watch docs paths to re-generate routes
  api.addTmpGenerateWatcherPaths(() => extraWatchPaths);

  // support to disable docDirs & atomDirs by empty array
  // because the empty array will be ignored by config merge logic
  api.modifyDefaultConfig((memo) => {
    if (api.userConfig.resolve) {
      const keys: ['docDirs', 'atomDirs'] = ['docDirs', 'atomDirs'];

      keys.forEach((key) => {
        if (api.userConfig.resolve![key]?.length === 0) memo.resolve[key] = [];
      });
    }

    return memo;
  });

  // generate dumi routes
  api.modifyRoutes((oRoutes) => {
    const pages: typeof oRoutes = {};
    const routes = Object.values(oRoutes).reduce<typeof oRoutes>(
      (ret, route) => {
        if (route.isLayout) {
          // retain layout routes, make sure api.addLayouts still works
          ret[route.id] = route;
        } else {
          // save page routes for later use
          pages[route.id] = route;
        }

        return ret;
      },
      {},
    );
    const { DocLayout, DemoLayout } = api.service.themeData.layouts;
    const { docDirs, atomDirs } = api.config.resolve;
    const layoutRouteValues = Object.values(routes);
    const lastLayoutId = layoutRouteValues.find(({ id }) =>
      layoutRouteValues.every(({ parentId }) => id !== parentId),
    )!.id;
    let docLayoutId = lastLayoutId;
    let demoLayoutId = lastLayoutId;

    // handle DocLayout from theme package
    if (DocLayout) {
      docLayoutId = DocLayout.specifier;
      routes[DocLayout.specifier] = {
        id: DocLayout.specifier,
        path: '/',
        file: DocLayout.source,
        parentId: lastLayoutId,
        absPath: '/',
        isLayout: true,
      };
    }

    // handle DemoLayout from theme package
    if (DemoLayout) {
      demoLayoutId = DemoLayout.specifier;
      routes[DemoLayout.specifier] = {
        id: DemoLayout.specifier,
        path: '/',
        file: DemoLayout.source,
        parentId: lastLayoutId,
        absPath: '/',
        isLayout: true,
      };
    }

    // prepend page routes from .dumi/pages
    Object.entries(pages).forEach(([, route]) => {
      route.file = winPath(
        path.resolve(api.config.conventionRoutes!.base!, route.file),
      );

      // save route
      routes[route.id] = route;
    });

    // generate normal docs routes
    docDirs.map(normalizeDocDir).forEach(({ type, dir }) => {
      const base = path.join(api.cwd, dir);
      const dirRoutes: Record<string, IRoute> = getConventionRoutes({
        base,
        exclude: [/.*(?<!md)$/, /(\/|^)(\.|_)/],
      });

      Object.entries(dirRoutes).forEach(([key, route]) => {
        // prefix id with dir, same as umi internal route id
        route.id = `${dir}/${key}`;

        // also allow prefix type for doc routes
        if (type) {
          const pluralType = plural(type);

          route.path = `${pluralType}/${route.path}`.replace(/\/+$/, '/');
          route.absPath = `/${route.path}`;
        }

        // use absolute path to avoid umi prefix with conventionRoutes.base
        route.file = winPath(path.resolve(base, route.file));

        // save route
        routes[route.id] = route;
      });
    });

    // generate atom routes
    atomDirs.forEach(({ type, dir }) => {
      const base = path.join(api.cwd, dir);
      const atomFiles = glob.sync(
        '{*,*/index,*/index.*,*/README,*/README.*}.md',
        { cwd: base },
      );

      atomFiles.forEach((file) => {
        const routeFile = winPath(path.join(plural(type), file));
        const routePath = routeFile
          .replace(/(\/index|\/README)?\.md$/, '')
          // like umi standard route
          // ref: https://github.com/umijs/umi/blob/cabb186057d801494340f533195b6b330e5ef4e0/packages/core/src/route/routesConvention.ts#L88
          .replace(/\./g, '/');
        const routeId = createRouteId(routeFile);

        routes[routeId] = {
          id: routeId,
          path: routePath,
          absPath: `/${routePath}`,
          parentId: docLayoutId,
          file: winPath(path.resolve(base, file)),
        };
      });
    });

    // normalize & validate conventional routes
    Object.values(routes).forEach((route) => {
      if (route.path !== encodeURI(route.path)) {
        // validate route path
        throw new Error(
          `Invalid route path: ${route.path}, please rename it with only alphanumeric, dash and slash.
    at ${route.file}`,
        );
      } else if (!route.isLayout) {
        // flat route
        flatRoute(route, docLayoutId);

        // localize route
        localizeUmiRoute(
          route,
          api.config.locales,
          api.config.resolve.forceKebabCaseRouting,
        );
      }
    });

    // append default 404 page
    if (Object.values(pages).every((route) => route.path !== '*')) {
      routes['404'] = {
        id: '404',
        path: '*',
        absPath: '/*',
        parentId: docLayoutId,
        file: getClientPageFile('client/pages/404', api.cwd),
      };
    }

    // append demo separate render page
    routes['demo-render'] = {
      id: 'demo-render',
      path: `${SP_ROUTE_PREFIX}demos/:id`,
      absPath: `/${SP_ROUTE_PREFIX}demos/:id`,
      parentId: demoLayoutId,
      file: getClientPageFile('client/pages/Demo', api.cwd),
      // disable prerender for demo render page, because umi-hd doesn't support ssr
      // ref: https://github.com/umijs/dumi/pull/1451
      prerender: false,
    };

    return routes;
  });

  // add outer layout
  api.addLayouts(() => {
    const layouts = [
      {
        id: CTX_LAYOUT_ID,
        file: `${api.paths.absTmpPath}/dumi/theme/ContextWrapper.tsx`,
      },
    ];
    const { GlobalLayout } = api.service.themeData.layouts;

    if (GlobalLayout) {
      layouts.unshift({
        id: GlobalLayout.specifier,
        file: GlobalLayout.source,
      });
    }

    return layouts;
  });

  api.addEntryCodeAhead(
    () => `
// always remove trailing slash from location.pathname
if (
  typeof history !== 'undefined' &&
  location.pathname.length > 1 &&
  location.pathname.endsWith('/')
) {
  history.replaceState(
    {},
    '',
    location.pathname.slice(0, -1) + location.search + location.hash,
  );
}
`,
  );
};
