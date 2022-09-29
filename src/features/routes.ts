import { SP_ROUTE_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import { getConventionRoutes } from '@umijs/core';
import { createRouteId } from '@umijs/core/dist/route/utils';
import path from 'path';
import { plural } from 'pluralize';
import type { IRoute } from 'umi';
import { glob, winPath } from 'umi/plugin-utils';

const CTX_LAYOUT_ID = 'dumi-context-layout';

/**
 * localize standard umi route path by locales config
 */
function localizeUmiRoute(route: IRoute, locales: IApi['config']['locales']) {
  const locale = locales.find(
    (locale) =>
      route.path.endsWith(`/${locale.id}`) &&
      // avoid locale id conflict with folder/file name
      path.parse(route.file).name.endsWith(`.${locale.id}`),
  );

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
    route.path = `${base}${route.path
      .replace(new RegExp(`/${locale.id}$`), '')
      .replace(/((^|\/)(index|README))$/, '')}${suffix}`;
    route.absPath = route.path !== '/' ? `/${route.path}` : route.path;
  }
}

export default (api: IApi) => {
  api.describe({ key: 'dumi:routes' });

  // disable umi built-in convention routes by a non-existent path
  api.modifyConfig((memo) => {
    memo.conventionRoutes = {
      base: path.join(__dirname, 'dumi-disable-default-routes'),
    };

    return memo;
  });

  // support to disable docDirs & entityDirs by empty array
  // because the empty array will be ignored by config merge logic
  api.modifyDefaultConfig((memo) => {
    if (api.userConfig.resolve) {
      const keys: ['docDirs', 'entityDirs'] = ['docDirs', 'entityDirs'];

      keys.forEach((key) => {
        if (api.userConfig.resolve![key]?.length === 0) memo.resolve[key] = [];
      });
    }

    return memo;
  });

  // generate dumi routes
  api.modifyRoutes((oRoutes) => {
    // retain layout routes, make sure api.addLayouts still works
    const routes = Object.values(oRoutes).reduce<typeof oRoutes>(
      (ret, route) => {
        if (route.isLayout) {
          ret[route.id] = route;
        }

        return ret;
      },
      {},
    );
    const { DocLayout, DemoLayout } = api.service.themeData.layouts;
    const { docDirs, entityDirs } = api.config.resolve;
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

    // generator normal docs routes
    docDirs.forEach((dir: string) => {
      const base = path.join(api.cwd, dir);
      const dirRoutes: Record<string, IRoute> = getConventionRoutes({
        base,
        exclude: [/.*(?<!md)$/],
      });

      Object.entries(dirRoutes).forEach(([key, route]) => {
        // prefix id with dir, same as umi internal route id
        route.id = `${dir}/${key}`;
        route.parentId = docLayoutId;

        // use absolute path to avoid umi prefix with conventionRoutes.base
        route.file = path.resolve(base, route.file);

        // localize route
        localizeUmiRoute(route, api.config.locales);

        // save route
        routes[route.id] = route;
      });
    });

    // generate entity routes
    entityDirs.forEach(({ type, dir }) => {
      const base = path.join(api.cwd, dir);
      const entityFiles = glob.sync(
        '{*,*/index,*/index.*,*/README,*/README.*}.md',
        { cwd: base },
      );

      entityFiles.forEach((file) => {
        const routePath = winPath(path.join(plural(type), file))
          .replace(/(\/index|\/README)?\.md$/, '')
          // like umi standard route
          // ref: https://github.com/umijs/umi/blob/cabb186057d801494340f533195b6b330e5ef4e0/packages/core/src/route/routesConvention.ts#L88
          .replace(/\./g, '/');
        const routeId = createRouteId(file);

        routes[routeId] = {
          id: routeId,
          path: routePath,
          absPath: `/${routePath}`,
          parentId: docLayoutId,
          file: path.resolve(base, file),
        };

        // localize route
        localizeUmiRoute(routes[routeId], api.config.locales);
      });
    });

    // append 404 page
    routes['404'] = {
      id: '404',
      path: '*',
      absPath: '/*',
      parentId: docLayoutId,
      file: require.resolve('../client/pages/404'),
    };

    // append demo separate render page
    routes['demo-render'] = {
      id: 'demo-render',
      path: `${SP_ROUTE_PREFIX}demos/:id`,
      absPath: `/${SP_ROUTE_PREFIX}demos/:id`,
      parentId: demoLayoutId,
      file: require.resolve('../client/pages/Demo'),
    };

    return routes;
  });

  // add outer layout
  api.addLayouts(() => {
    const layouts = [
      {
        id: CTX_LAYOUT_ID,
        file: '@/.umi/dumi/theme/ContextWrapper.tsx',
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
};
