import type { IRoute } from '@umijs/types';
import type { RouteProcessor } from '.';
import type { IMenuItem } from '../getMenuFromRoutes';
import { menuSorter } from '../getMenuFromRoutes';

/**
 * 获取分组菜单的数组
 * @param validRoutes
 */
const genValidGroups = validRoutes =>
  validRoutes.reduce((result, item) => {
    if (item.meta.group?.path) {
      const { title, path, ...resGroupMeta } = item.meta.group;

      result.push({ title, path, meta: { ...resGroupMeta, nav: item.meta.nav } });
    }

    return result;
  }, []);

/**
 * get first menu route in current nav
 * @param childRoutes   nav child routes
 * @param customMenus   user custom menus
 */
function getFirstMenuInNav(childRoutes: IRoute[], customMenus?: IMenuItem[]) {
  let firstMenuInNav: IRoute;

  const customFirstMenu = customMenus?.[0];
  const firstMenuItem = customFirstMenu?.path ? customFirstMenu : customFirstMenu?.children?.[0];

  // find first if user configured the first menu item for current nav
  if (typeof firstMenuItem === 'string') {
    // find first menu route by string menu item, like src/Button/index.md
    firstMenuInNav = childRoutes.find(route => {
      if (route.component?.includes(firstMenuItem)) {
        return route;
      }
    });
  } else if (firstMenuItem?.path) {
    // use menu item config as first menu route if it is object
    firstMenuInNav = firstMenuItem;
  } else if (!firstMenuInNav) {
    // use first child routes of nav as menu route by default
    firstMenuInNav = childRoutes.sort(menuSorter)[0];
  }

  return firstMenuInNav;
}

/**
 * get first menu in side menu
 * @param childRoutes      menu child routes
 * @param currentMenuPath  current menu path
 * @param customMenus      user custom menus
 */
function getFirstMenuInMenu(
  childRoutes: IRoute[],
  currentMenuPath: string,
  customMenus?: Record<string, IMenuItem[]>,
) {
  let firstMenuInMenu: IRoute;
  const haveOrderChild = childRoutes.some(route => typeof route.meta?.order === 'number');

  // if any of children menus don't have order attr
  if (!haveOrderChild) {
    // flat config menus once for finding children menus easier
    const flatMenus = Object.keys(customMenus || {}).reduce(
      (pre, curr) => [...pre, ...customMenus[curr]],
      [],
    );
    // find the first child of current Menu
    const targetMenus = flatMenus.find(i => i.path === currentMenuPath)?.children?.[0];

    if (typeof targetMenus === 'string') {
      // in case menu is a string
      firstMenuInMenu = childRoutes.find(route => route.component?.includes(targetMenus));
    } else if (targetMenus?.path) {
      // use menu item config as first menu route if it is object
      firstMenuInMenu = targetMenus;
    }
  }

  if (!firstMenuInMenu) {
    // use first child routes of current menus as menu route by default
    firstMenuInMenu = childRoutes.sort(menuSorter)[0];
  }
  return firstMenuInMenu;
}

/**
 * generate redirects for missing group index routes & legacy route paths
 */
export default (function redirect(routes) {
  const redirects = [];

  routes.forEach(route => {
    // add index route redirect for group which has no index route
    if (
      route.meta.group?.path &&
      !redirects[route.meta.group.path] &&
      !routes.some(item => item.path === route.meta.group.path)
    ) {
      const { title, path, ...resGroupMeta } = route.meta.group;

      const childRoutes = routes.filter(item => item.meta.group?.path === route.meta.group.path);

      redirects[path] = {
        path,
        meta: {
          ...resGroupMeta,
        },
        exact: true,
        redirect: getFirstMenuInMenu(childRoutes, path, this.options.menus).path,
      };
    }

    // add index route redirect for nav which has no index route
    if (
      route.meta.nav?.path &&
      !redirects[route.meta.nav.path] &&
      !routes.some(item => item.path === route.meta.nav.path)
    ) {
      const { title, path, ...resNavMeta } = route.meta.nav;
      const validRoutes = routes.filter(item => item.meta.nav?.path === route.meta.nav.path);
      // concat valid groups to find redirect to ensure the redirect order same as menu order
      const validGroups = genValidGroups(validRoutes);

      redirects[path] = {
        path,
        meta: {
          ...resNavMeta,
        },
        exact: true,
        redirect: getFirstMenuInNav(validRoutes.concat(validGroups), this.options.menus?.[path])
          .path,
      };
    }

    // append redirect for legacy path
    if (route.meta.legacy) {
      redirects[route.meta.legacy] = {
        path: route.meta.legacy,
        exact: true,
        redirect: route.path,
      };
    }
  });

  return routes.concat(Object.values(redirects));
} as RouteProcessor);
