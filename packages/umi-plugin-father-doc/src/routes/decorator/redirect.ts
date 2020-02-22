import { RouteProcessor } from '.';
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
 * generate redirects for missing group index routes & legacy route paths
 */
export default (routes => {
  const redirects = [];

  routes.forEach(route => {
    // add index route redirect for group which has no index route
    if (
      route.meta.group?.path &&
      !redirects[route.meta.group.path] &&
      !routes.some(item => item.path === route.meta.group.path)
    ) {
      const { title, path, ...resGroupMeta } = route.meta.group;

      redirects[path] = {
        path,
        meta: {
          ...resGroupMeta,
        },
        exact: true,
        redirect: routes
          .filter(item => item.meta.group?.path === route.meta.group.path)
          .sort(menuSorter)[0].path,
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
        redirect: validRoutes.concat(validGroups).sort(menuSorter)[0].path,
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
}) as RouteProcessor;
