import path from 'path';
import slash from 'slash2';
import { IRoute } from '@umijs/types';
import { IDumiOpts } from '..';

export interface IMenuItem {
  path?: string;
  title: string;
  meta?: { [key: string]: any };
  children?: IMenuItem[];
}

export interface IMenu {
  // locale level
  [key: string]: {
    // path level
    '*'?: IMenuItem[];
    [key: string]: IMenuItem[];
  };
}

function isValidMenuRoutes(route: IRoute) {
  return Boolean(route.path) && !route.redirect;
}

function isSameRouteComponent(
  fragment: string,
  component: string,
  includes: IDumiOpts['resolve']['includes'],
) {
  return includes.some(dir => component.indexOf(slash(path.join(dir, fragment))) > -1);
}

function convertUserMenuChilds(
  menus: IMenuItem[],
  routes: IRoute[],
  locale: string,
  isDefaultLocale: boolean,
  includes: IDumiOpts['resolve']['includes'],
) {
  menus.forEach(menu => {
    if (menu.path && locale && !isDefaultLocale && !menu.path.startsWith(`/${locale}`)) {
      menu.path = `/${locale}${menu.path}`;
    }

    (menu.children || []).forEach((child, i) => {
      if (typeof child === 'string') {
        const route =
          routes.find(route => {
            if (
              route.component &&
              isSameRouteComponent(child, route.component, includes) &&
              (route.meta?.locale === locale || (!route.meta?.locale && isDefaultLocale))
            ) {
              return true;
            }
          }) || {};

        menu.children[i] = {
          path: route.path,
          title: route.title,
        };
      }
    });
  });

  return menus;
}

export function menuSorter(prev, next) {
  const prevOrder = typeof prev.meta?.order === 'number' ? prev.meta.order : Infinity;
  const nextOrder = typeof next.meta?.order === 'number' ? next.meta.order : Infinity;
  // compare order meta config first
  const metaOrder = prevOrder === nextOrder ? 0 : prevOrder - nextOrder;
  // last compare path length
  const pathOrder = prev.path.length - next.path.length;
  // then compare title ASCII
  const ascOrder = prev.title > next.title ? 1 : prev.title < next.title ? -1 : 0;

  return metaOrder || pathOrder || ascOrder;
}

export default function getMenuFromRoutes(
  routes: IRoute[],
  opts: IDumiOpts,
  userMenus: IDumiOpts['menus'] = {},
): IMenu {
  // temporary menus mapping
  const localeMenusMapping: {
    // locale level
    [key: string]: {
      // path level
      [key: string]: {
        // group path level (only use for group routes by path)
        [key: string]: IMenuItem;
      };
    };
  } = {};
  let localeMenus: IMenu = {};

  routes.forEach(route => {
    if (isValidMenuRoutes(route)) {
      const group = route.meta.group;
      const nav = route.meta.nav?.path || '*';
      const locale = route.meta.locale || opts.locales[0]?.[0] || '*';
      const menuItem: IMenuItem = {
        path: route.path,
        title: route.title,
        meta: {},
      };

      if (route.meta?.order) {
        menuItem.meta.order = route.meta.order;
      }

      if (group?.path) {
        const { title, path, ...meta } = group;

        // group route items by group path & locale
        localeMenusMapping[locale] = {
          ...(localeMenusMapping[locale] || {}),
          [nav]: {
            ...(localeMenusMapping[locale]?.[nav] || {}),
            [group.path || group.title]: {
              title,
              path,
              meta: {
                // merge group meta
                ...(localeMenusMapping[locale]?.[nav]?.[group.path]?.meta || {}),
                ...meta,
              },
              children: (localeMenusMapping[locale]?.[nav]?.[group.path]?.children || []).concat(
                menuItem,
              ),
            },
          },
        };
      } else {
        // push route to top-level if it has not group
        localeMenusMapping[locale] = {
          ...(localeMenusMapping[locale] || {}),
          [nav]: {
            ...(localeMenusMapping[locale]?.[nav] || {}),
            [menuItem.path]: menuItem,
          },
        };
      }
    }
  });

  // deconstruct locale menus from mapping to array
  Object.keys(localeMenusMapping).forEach(locale => {
    Object.keys(localeMenusMapping[locale]).forEach(nav => {
      const menus = Object.values(localeMenusMapping[locale][nav]).map((menu: IMenuItem) => {
        // sort child menu items
        menu.children?.sort(menuSorter);

        return menu;
      });

      // discard empty locale
      if (menus.length) {
        localeMenus[locale] = {
          ...(localeMenus[locale] || {}),
          // sort top-level menu items
          [nav]: menus.sort(menuSorter),
        };
      }
    });
  });

  // merge user menus
  Object.keys(userMenus).forEach(navPath => {
    [...opts.locales].reverse().some(locale => {
      const isDefaultLocale = locale[0] === opts.locales[0][0];
      const localePrefix = isDefaultLocale ? '/' : `/${locale[0]}`;

      if (navPath.startsWith(localePrefix)) {
        convertUserMenuChilds(
          userMenus[navPath],
          routes,
          locale[0],
          isDefaultLocale,
          opts.resolve.includes,
        );
        localeMenus[locale[0]][navPath] = userMenus[navPath];

        return true;
      }
    });
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
