import { IApi, IRoute } from 'umi-types';
import { IFatherDocOpts } from '..';

export interface IMenuItem {
  path?: string;
  title: string;
  meta?: { [key: string]: any };
  children?: IMenuItem[];
}

export interface IMenu {
  // locale level
  [key: string]: IMenuItem[];
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
  const ascOrder = prev.title > next.title ? 1 : prev.title < next.title ? -1 : 0;
  // last compare path length
  const pathOrder = prev.path.length - next.path.length;

  return metaOrder || ascOrder || pathOrder;
}

export default function getMenuFromRoutes(routes: IApi['routes'], opts: IFatherDocOpts): IMenu {
  // temporary menus mapping
  const localeMenusMapping: {
    // locale level
    [key: string]: {
      // group path level (only use for group routes by path)
      [key: string]: IMenuItem;
    };
  } = {};
  let localeMenus: IMenu = {};

  routes.forEach(route => {
    if (isValidMenuRoutes(route)) {
      const group = route.meta.group;
      const locale = route.meta.locale || opts.locales[0]?.[0] || '*';
      const menuItem = {
        path: route.path,
        title: route.title,
        meta: route.meta,
      };

      if (group?.path) {
        const { title, path, ...meta } = group;

        // group route items by group path & locale
        localeMenusMapping[locale] = {
          ...(localeMenusMapping[locale] || {}),
          [group.path]: {
            title,
            path,
            meta: {
              // merge group meta
              ...(localeMenusMapping[locale]?.[group.path]?.meta || {}),
              ...meta,
            },
            children: (localeMenusMapping[locale]?.[group.path]?.children || []).concat(menuItem),
          },
        };
      } else {
        // push route to top-level if it has not group
        localeMenusMapping[locale] = {
          ...(localeMenusMapping[locale] || {}),
          [menuItem.path]: menuItem,
        };
      }
    }
  });

  // deconstuct locale menus from mapping to array
  Object.keys(localeMenusMapping).forEach(locale => {
    const menus = Object.values(localeMenusMapping[locale]).map((menu: IMenuItem) => {
      // sort child menu items
      menu.children?.sort(menuSorter);

      return menu;
    });

    // discard empty locale
    if (menus.length) {
      // sort top-level menu items
      localeMenus[locale] = menus.sort(menuSorter);
    }
  });

  // replace unique locale key with *
  Object.keys(localeMenus).some((locale, _, locales) => {
    if (locales.length === 1) {
      localeMenus = {
        '*': localeMenus[locale],
      };
    }

    return true;
  });

  return localeMenus;
}
