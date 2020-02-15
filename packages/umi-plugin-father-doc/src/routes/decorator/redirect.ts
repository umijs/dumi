import { RouteProcessor } from '.';
import { menuSorter } from '../getMenuFromRoutes';

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
