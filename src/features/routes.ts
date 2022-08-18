import type { IApi } from '@/types';
import { getConventionRoutes } from '@umijs/core';
import path from 'path';
import { plural } from 'pluralize';
import type { IRoute } from 'umi';
import { glob, winPath } from 'umi/plugin-utils';

const CTX_LAYOUT_ID = 'dumi-context-layout';

export default (api: IApi) => {
  api.describe({ key: 'dumi:routes' });

  // disable umi built-in convention routes by a non-existent path
  api.modifyConfig((memo) => {
    memo.conventionRoutes = {
      base: path.join(__dirname, 'dumi-disable-default-routes'),
    };

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
    const { docDirs, entityDirs } = api.config.resolve;

    // generator normal docs routes
    docDirs.forEach((dir: string) => {
      const base = path.join(api.cwd, dir);
      const dirRoutes: Record<string, IRoute> = getConventionRoutes({
        base,
        exclude: [/.*(?<!md)$/],
      });

      Object.entries(dirRoutes).forEach(([key, route]) => {
        // prefix id with dir
        route.id = `${dir}/${key}`;
        route.parentId = CTX_LAYOUT_ID;

        // use absolute path to avoid umi prefix with conventionRoutes.base
        route.file = path.resolve(base, route.file);

        // save route
        routes[route.id] = route;
      });
    });

    // generate entity routes
    entityDirs.forEach(({ type, dir }) => {
      const base = path.join(api.cwd, dir);
      const entityFiles = glob.sync('{*,*/index,*/README}.md', { cwd: base });

      entityFiles.forEach((file) => {
        const routePath = winPath(path.join(plural(type), file)).replace(
          /(\/index|\/README)?\.md$/,
          '',
        );
        const routeId = `${dir}/${routePath}`;

        routes[routeId] = {
          id: routeId,
          path: routePath,
          absPath: routePath,
          parentId: CTX_LAYOUT_ID,
          file: path.resolve(base, file),
        };
      });
    });

    return routes;
  });

  // add context layout
  api.addLayouts(() => ({
    id: CTX_LAYOUT_ID,
    file: '@/.umi/dumi/theme/ContextWrapper.tsx',
  }));
};
