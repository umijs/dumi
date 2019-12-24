import { IApi, IRoute } from 'umi-types';

export interface IMenuItem {
  path?: string;
  title: string;
  meta?: { [key: string]: any };
  children?: IMenuItem[];
}

function isValidMenuRoutes(route: IRoute) {
  return Boolean(route.path) && !route.redirect;
}

function menuSorter(prev, next) {
  const prevOrder = typeof prev.meta.order === 'number' ? prev.meta.order : 0;
  const nextOrder = typeof next.meta.order === 'number' ? next.meta.order : 0;

  return prevOrder === nextOrder ? 0 : nextOrder - prevOrder;
}

export default function getMenuFromRoutes(routes: IApi['routes']): IMenuItem[] {
  const menu: IMenuItem[] = [];

  // split routes to grouped & ungrouped menu items
  const [groupedMapping, ungrouped] = routes.filter(isValidMenuRoutes).reduce((result, route) => {
    const group = route.meta?.group;
    const key = group?.path;
    const menuItem = {
      path: route.path,
      title: route.title,
      meta: route.meta,
    };

    if (key) {
      result[0][key] = result[0][key] || { ...group, meta: {}, children: [] };
      result[0][key].children.push(menuItem);
    } else {
      result[1].push(menuItem);
    }

    return result;
  }, [{}, []]);

  // merge grouped & unngrouped menus
  menu.push(...ungrouped, ...Object.keys(groupedMapping).map(key => groupedMapping[key]));

  // sort routes
  menu.sort(menuSorter);
  menu.forEach(menu => {
    if (menu.children) {
      menu.children.sort(menuSorter);
    }
  });

  return menu;
}
