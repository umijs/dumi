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
 * get first menu route in current nav/menu
 * @param childRoutes   nav/menu child routes
 * @param customMenus   user custom menus
 */
function getFirstMenuInParent(childRoutes: IRoute[], customMenus?: IMenuItem[]) {
  let firstMenuInParent: IRoute;
  const firstMenuItem = customMenus?.[0].children?.[0] || customMenus?.[0];
  // find first if user configured the first menu item for current nav/menu
  if (typeof firstMenuItem === 'string') {
    // find first menu route by string menu item, like src/Button/index.md
    firstMenuInParent = childRoutes.find(route => {
      if (route.component?.includes(firstMenuItem)) {
        return route;
      }
    });
  } else if (firstMenuItem?.path) {
    // use menu item config as first menu route if it is object
    firstMenuInParent = firstMenuItem;
  } else if (!firstMenuInParent) {
    // use first child routes of nav/menu as menu route by default
    firstMenuInParent = childRoutes.sort(menuSorter)[0];
  }

  return firstMenuInParent;
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
      const validRoutes = routes.filter(item => item.meta.group?.path === route.meta.group.path);
      const validItems = Object.values(this.options.menus || {})
        .reduce((r, i) => r.concat(i), [])
        .find(item => item.path === path)?.children;

      redirects[path] = {
        path,
        meta: {
          ...resGroupMeta,
        },
        exact: true,
        redirect: getFirstMenuInParent(validRoutes, validItems).path,
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
        redirect: getFirstMenuInParent(validRoutes.concat(validGroups), this.options.menus?.[path])
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
