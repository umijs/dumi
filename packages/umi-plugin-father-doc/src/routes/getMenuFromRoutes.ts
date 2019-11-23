import path from 'path';
import { IApi } from 'umi-types';

export interface IMenuItem {
  path: string;
  title: string;
  meta?: { [key: string]: any };
  children: IMenuItem[];
}

export default (routes: IApi['routes']) : IMenuItem[] => {
  const menu: IMenuItem[] = [];

  routes.forEach((route) => {

    if (route.path) {
      menu.push({
        path: route.path,
        title: route.meta.title || path.parse(route.component as string).name,
        meta: route.meta,
        children: [],
      });
    }
  });

  return menu;
}
