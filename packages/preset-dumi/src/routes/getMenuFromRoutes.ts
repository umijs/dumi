import path from 'path';
import slash from 'slash2';
import ctx from '../context';
import { addLocalePrefix, isPrefixLocalePath } from './decorator/locale';
import type { IRoute, IApi } from '@umijs/types';
import type { IDumiOpts } from '..';

export interface IMenuItem {
  path?: string;
  title: string;
  meta?: Record<string, any>;
  children?: IMenuItem[];
}

export type IMenu = Record<string, {
    // path level
    '*'?: IMenuItem[];
    [key: string]: IMenuItem[];
  }>;

function isValidMenuRoutes(route: IRoute) {
  return Boolean(route.path) && !route.redirect;
}

function isSameRouteComponent(
  fragment: string,
  component: string,
  includes: IDumiOpts['resolve']['includes'],
  paths: IApi['paths'],
) {
  return includes.some(dir => {
    const cwdRelativeComponentPath = slash(
      path.relative(paths.cwd, path.join(paths.absTmpPath, 'core', component)),
    );

    return cwdRelativeComponentPath.indexOf(slash(path.join(dir, fragment))) > -1;
  });
}

function convertUserMenuChilds(
  menus: IMenuItem[],
  routes: IRoute[],
  locale: string,
  isDefaultLocale: boolean,
  includes: IDumiOpts['resolve']['includes'],
  paths: IApi['paths'],
) {
  return menus.map(menu => {
    // copy menu config to avoid modify user config
    const menuItem = Object.assign({}, menu);

    if (menuItem.path && locale && !isDefaultLocale && !isPrefixLocalePath(menuItem.path, locale)) {
      menuItem.path = addLocalePrefix(menu.path, locale);
    }

    if (menuItem.children) {
      menuItem.children = menu.children.map(child => {
        let childItem = child;

        if (typeof child === 'string') {
          const route = routes.find(routeItem => {
            if (
              routeItem.component &&
              isSameRouteComponent(child, routeItem.component, includes, paths) &&
              (routeItem.meta?.locale === locale || (!routeItem.meta?.locale && isDefaultLocale))
            ) {
              return true;
            }
          });

          if (!route) {
            throw new Error(
              `[dumi]: cannot find ${child} from menu config, please make sure file exist!`,
            );
          }

          childItem = {
            path: route.path,
            title: route.meta.title,
          };

          route.meta = route.meta || {};

          // update original route group
          route.meta.group = {
            title: menu.title,
            ...(menu.path ? { path: menu.path } : {}),
            ...(route.meta?.group || {}),
          };
        }

        return childItem;
      });
    }

    return menuItem;
  });
}

export function addHtmlSuffix(oPath: string) {
  if (oPath && ctx.umi?.config?.exportStatic && ctx.umi.config.exportStatic.htmlSuffix) {
    return `${oPath}.html`;
  }

  return oPath;
}

export function menuSorter(prev, next) {
  const prevOrder = typeof prev.meta?.order === 'number' ? prev.meta.order : Infinity;
  const nextOrder = typeof next.meta?.order === 'number' ? next.meta.order : Infinity;
  // compare order meta config first
  const metaOrder = prevOrder === nextOrder ? 0 : prevOrder - nextOrder;
  // last compare path ASCII
  const pathOrder = prev.path > next.path ? 1 : -1;

  return metaOrder || pathOrder;
}

export default function getMenuFromRoutes(
  routes: IRoute[],
  opts: IDumiOpts,
  paths: IApi['paths'],
): IMenu {
  // temporary menus mapping
  const localeMenusMapping: Record<string, Record<string, Record<string, IMenuItem>>> = {};
  const { menus: userMenus = {} } = opts;
  const localeMenus: IMenu = {};

  routes.forEach(route => {
    if (isValidMenuRoutes(route)) {
      const { group } = route.meta;
      const nav = addHtmlSuffix(route.meta.nav?.path) || '*';
      const locale = route.meta.locale || opts.locales[0][0];
      const menuItem: IMenuItem = {
        path: route.path,
        title: route.meta.title,
        meta: {},
      };

      if (typeof route.meta?.order === 'number') {
        menuItem.meta.order = route.meta.order;
      }

      if (group?.path) {
        const { title, path: groupPath, ...meta } = group;
        const groupKey = (!group.__fallback && addHtmlSuffix(groupPath)) || title;
        const isGroupPathValid = !(group.__fallback && opts.mode === 'site');

        // group route items by group path & locale
        localeMenusMapping[locale] = {
          ...(localeMenusMapping[locale] || {}),
          [nav]: {
            ...(localeMenusMapping[locale]?.[nav] || {}),
            [groupKey]: {
              title,
              ...(isGroupPathValid
                ? {
                    path: localeMenusMapping[locale]?.[nav]?.[groupKey]?.path || groupPath,
                  }
                : {}),
              meta: {
                // merge group meta
                ...(localeMenusMapping[locale]?.[nav]?.[groupKey]?.meta || {}),
                ...meta,
              },
              children: (localeMenusMapping[locale]?.[nav]?.[groupKey]?.children || []).concat(
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
        // discard children if current menu only has 1 children
        if (menu.children?.length === 1 && menu.title === menu.children[0].title) {
          if (typeof menu.children[0].meta?.order === 'number') {
            menu.meta.order = menu.children[0].meta.order;
          }
          // fallback to child path if menu has not path
          menu.path = menu.path || menu.children[0].path;
          menu.children = [];
        }

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

      if (localePrefix === '/' || isPrefixLocalePath(navPath, locale[0])) {
        const convertedMenus = convertUserMenuChilds(
          userMenus[navPath],
          routes,
          locale[0],
          isDefaultLocale,
          opts.resolve.includes,
          paths,
        );

        localeMenus[locale[0]][navPath] = convertedMenus;

        // update original nav index page
        routes.forEach(route => {
          if (
            route.path === slash(path.join(localePrefix, navPath)) &&
            route.redirect &&
            (convertedMenus[0].path || convertedMenus[0].children)
          ) {
            route.redirect = convertedMenus[0].path || convertedMenus[0].children[0].path;
          }
        });

        return true;
      }
    });
  });

  return localeMenus;
}
