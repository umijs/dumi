import type { IApi, IRoute } from '@umijs/types';
import ctx from '../../context';
import getRouteConfig, { DUMI_ROOT_FLAG } from '../../routes/getRouteConfig';
import separateMetaFromRoutes from '../../routes/separateMetaFromRoutes';

let metas = {};
let metaRoutes = [];
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
      return findRoot(oRoutes);
    },
  });

  api.register({
    key: 'dumi.getMetaRoutes',
    async fn(oRoutes: IRoute[] = []) {
      return findRoot(metaRoutes);
    },
  });

  const generateMetasFile = () => {
    api.writeTmpFile({
      path: 'dumi/metas.json',
      content: JSON.stringify(metas, null, 2),
    });
  };

  // write all metas into .umi dir
  api.onGenerateFiles(() => {
    generateMetasFile();
  });

  api.register({
    key: 'dumi.detectMetas',
    async fn({ identifier, data }) {
      const isUpdated = Boolean(metas[identifier]);

      metas[identifier] = data;

      if (isUpdated) {
        generateMetasFile();
      }
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

      routes.splice(rootHtmlIndex, 1);
    }
  });

  api.modifyRoutes((routes) => {
    metaRoutes = JSON.parse(JSON.stringify(routes));
    const { routes: separateRoutes, metas: separateMetas } = separateMetaFromRoutes(routes);
    metas = separateMetas;
    return separateRoutes;
  });

};
