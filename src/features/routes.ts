import type { IApi } from '@/types';
import { getConventionRoutes } from '@umijs/core/dist/route/routesConvention';
import path from 'path';
import type { IRoute } from 'umi';

export default (api: IApi) => {
  api.describe({ key: 'dumi-routes' });

  // disable umi built-in convention routes by a non-existent path
  api.modifyConfig((memo) => {
    memo.conventionRoutes = {
      base: path.join(__dirname, 'dumi-disable-default-routes'),
    };

    return memo;
  });

  // generate dumi routes
  api.modifyRoutes(() => {
    const routes: Record<string, IRoute> = {};
    const { docDirs } = api.config.resolve;

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

        // use absolute path to avoid umi prefix with conventionRoutes.base
        route.file = path.resolve(base, route.file);

        // save route
        routes[route.id] = route;
      });
    });

    return routes;
  });
};
