import type { IApi, IRoute } from '@umijs/types';
import ctx from '../../context';
import getRouteConfig, { DUMI_ROOT_FLAG } from '../../routes/getRouteConfig';

/**
 * plugin for generate routes
 */
export default (api: IApi) => {
  // generate docs routes
  api.onPatchRoutesBefore(async ({ routes, parentRoute }) => {
    // only deal with the top level routes
    if (!parentRoute) {
      const result = await getRouteConfig(api, ctx.opts);

      if (ctx.opts.isIntegrate) {
        // unshit docs routes in integrate mode
        routes.unshift(...result);
      } else {
        // clear original routes
        routes.splice(0, routes.length);

        // append new routes
        routes.push(...result);
      }
    }
  });

  api.register({
    key: 'dumi.getRootRoute',
    async fn(oRoutes: IRoute[] = []) {
      const findRoot = (routes: IRoute[]) => {
        for (let i = 0; i < routes.length; i += 1) {
          if (routes[i][DUMI_ROOT_FLAG]) {
            return routes[i];
          }

          const childRoot = findRoot(routes[i].routes || []);

          if (childRoot) {
            return childRoot;
          }
        }

        return null;
      };

      return findRoot(oRoutes);
    },
  });

  // add empty component for root layout
  // TODO: move this logic into getRouteConfig and make sure tests passed
  api.onPatchRoute(({ route }) => {
    if (route[DUMI_ROOT_FLAG]) {
      route.component = '(props) => props.children';
    }
  });

  // remove useless /index.html from exportStatic feature
  api.onPatchRoutes(({ routes, parentRoute }) => {
    if (api.config.exportStatic && parentRoute?.[DUMI_ROOT_FLAG]) {
      const rootHtmlIndex = routes.findIndex(route => route.path === '/index.html');

      if (rootHtmlIndex > -1) {
        routes.splice(rootHtmlIndex, 1);
      }
    }
  });
};
