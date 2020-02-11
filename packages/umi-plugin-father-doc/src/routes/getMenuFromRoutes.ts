import { IApi, IRoute } from 'umi-types';
import { IFatherDocOpts } from '..';

export interface IMenuItem {
  path?: string;
  title: string;
  meta?: { [key: string]: any };
  children?: IMenuItem[];
}

export interface IMenu {
  locale?: {
    name: string;
    label: string;
  };
  items: IMenuItem[];
}

function isValidMenuRoutes(route: IRoute) {
  return Boolean(route.path) && !route.redirect;
}

export function menuSorter(prev, next) {
  const prevOrder = typeof prev.meta.order === 'number' ? prev.meta.order : 0;
  const nextOrder = typeof next.meta.order === 'number' ? next.meta.order : 0;
  // compare order meta config first
  const metaOrder = prevOrder === nextOrder ? 0 : nextOrder - prevOrder;
  // then compare title ASCII
  const ascOrder = prev.title > next.title ? 1 : (prev.title < next.title ? -1 : 0);
  // last compare path length
  const pathOrder = prev.path.length - next.path.length;

  return metaOrder || ascOrder || pathOrder;
}

export default function getMenuFromRoutes(routes: IApi['routes'], opts: IFatherDocOpts): IMenu[] {
  const menus: IMenu[] = opts.locales.length ?
    // generate initial menus from locales
    opts.locales.map(([name, label]) => ({
      locale: {
        name,
        label,
      },
      items: [],
    })) :
    // fallback to unique locale
    [{ items: [] }];
  const validRoutes = routes.filter(isValidMenuRoutes);

  menus.forEach(({ locale: { name } = {}, items }, isNotDefault) => {
    // split routes to grouped & ungrouped menu items
    const [groupedMapping, ungrouped] = validRoutes
      // filter routes for current locale
      .filter(({ meta: { locale } }) => (
        locale === name ||
        // no locale routes fallback into the default locale
        (!locale && !isNotDefault)
      ))
      .reduce((result, route) => {
        const group = route.meta?.group;
        const key = group?.path;
        const menuItem = {
          path: route.path,
          title: route.title,
          meta: route.meta,
        };

        if (key) {
          const { title, path, ...meta } = group;

          result[0][key] = result[0][key] || { title, path, meta, children: [] };
          result[0][key].children.push(menuItem);
        } else {
          result[1].push(menuItem);
        }

        return result;
      }, [{}, []]);

    // merge grouped & unngrouped menus
    items.push(...ungrouped, ...Object.keys(groupedMapping).map(key => groupedMapping[key]));

    // sort routes
    items.sort(menuSorter);
    items.forEach(menu => {
      if (menu.children) {
        menu.children.sort(menuSorter);
      }
    });
  });

  // remove useless locales if there has no locale menus
  if (menus.filter(menu => menu.items.length).length === 1) {
    menus.splice(1);
    delete menus[0].locale;
  }

  return menus;
}
