import { IApi } from 'umi-types';

export interface IMenuItem {
  path?: string;
  title: string;
  meta?: { [key: string]: any };
  children?: IMenuItem[];
}

export default function getMenuFromRoutes(routes: IApi['routes']) : IMenuItem[] {
  let menu: IMenuItem[] = [];

  // convert routes to menu
  routes.forEach((route) => {
    if (route.path && route.meta) {
      menu.push({
        path: route.path,
        title: route.meta.title || (route.path.match(/\w+$/) || [])[1],
        meta: route.meta,
        children: getMenuFromRoutes(route.routes || []),
      });
    }
  });

  return menu;
}
