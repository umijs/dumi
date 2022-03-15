import type { IApi } from 'umi';

/**
 * generate a 404.html to make sure dynamic routes can be resolved on deploy platform
 */
export default (api: IApi) => {
  // TODO: UMI4 api.modifyExportRouteMap is no support in umi@4
  // api.modifyExportRouteMap(defaultRouteMap => {
  //   // use dynamic route to avoid Umi SSR render content
  //   defaultRouteMap.unshift({ route: { path: '/:404' }, file: '404.html' });

  //   return defaultRouteMap;
  // });
};
