import { IApi } from '@umijs/types';
import ctx from '../../context';
import getRouteConfig from '../../routes/getRouteConfig';

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

  // add empty component for root layout
  // TODO: move this logic into getRouteConfig and make sure tests passed
  api.modifyRoutes(routes => {
    routes.find(route => route._dumiRoot).component = '(props) => props.children';

    return routes;
  });

  // remove useless /index.html from exportStatic feature
  api.onPatchRoutes(({ routes, parentRoute }) => {
    if (api.config.exportStatic && parentRoute?._dumiRoot) {
      const rootHtmlIndex = routes.findIndex(route => route.path === '/index.html');

      routes.splice(rootHtmlIndex, 1);
    }
  });
};
