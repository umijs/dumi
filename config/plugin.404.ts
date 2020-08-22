import { IApi } from 'dumi';

export default (api: IApi) => {
  // add 404 page
  api.modifyExportRouteMap(async (defaultRouteMap, { html }) => {
    const routeMap = (await html.getRouteMap()) || defaultRouteMap;

    routeMap.push({ route: { path: '/404' }, file: '404.html' });

    return routeMap;
  });
};
