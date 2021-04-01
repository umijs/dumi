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
 * to find current path's children in menus
 * @param path  current path
 * @param menus user config menus
 */
function getTargetPathChildren(path: string, menus?: Record<string, IMenuItem[]>) {
  if (!menus) {
    return null;
  }
  let res: IMenuItem;
  /**
   * to destructe menus object to array
   * @example { '/a': [{...}] } => [{...}]
   */
  let targets: IMenuItem[] = Object.keys(menus).reduce((pre, curr) => [...pre, ...menus[curr]], []);
  while (targets.length) {
    const currentMenu = targets.find(menu => menu.path === path);
    // to find target menu among current level menus
    if (currentMenu) {
      res = currentMenu;
      targets = [];
    } else {
      // if find nothing, continue to find children menus util there is no children menus
      targets = targets.reduce((pre, curr) => {
        return [...pre, ...(curr.children || [])];
      }, []);
    }
  }
  return res?.children || [];
}

function getFirstMenuFromMenus(
  childRoutes: IRoute[],
  currentPath: string,
  customMenus?: Record<string, IMenuItem[]>,
) {
  let firstMenuInMenu: IRoute;
  const haveOrderChild = childRoutes.some(route => typeof route.meta?.order === 'number');

  // if any of children menus don't have order attr
  if (!haveOrderChild) {
    // to find the children of this menu corresponding to the current path
    const currentMenus = (customMenus || {}).hasOwnProperty(currentPath)
      ? customMenus[currentPath]
      : getTargetPathChildren(currentPath, customMenus);

    const firstMenu = currentMenus?.[0];
    // determine whether the current menu is valid according to the path
    const firstMenuItem = firstMenu?.path ? firstMenu : firstMenu?.children?.[0];

    if (typeof firstMenuItem === 'string') {
      firstMenuInMenu = childRoutes.find(route => route.component?.includes(firstMenuItem));
    } else if (firstMenuItem?.path) {
      firstMenuInMenu = firstMenuItem;
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
        redirect: getFirstMenuFromMenus(childRoutes, path, this.options.menus).path,
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
        redirect: getFirstMenuFromMenus(validRoutes.concat(validGroups), path, this.options.menus)
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
