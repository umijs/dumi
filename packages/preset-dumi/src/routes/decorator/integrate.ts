import type { RouteProcessor } from '.';

/**
 * global route prefix in integrate mode
 */
const INTEGRATE_ROUTE_PREFIX = '/~docs';

export function prefix(oPath: string) {
  return `${INTEGRATE_ROUTE_PREFIX}${oPath}`.replace(/\/$/, '');
}

/**
 * add route prefix when integrate dumi in a Umi project
 */
export default (function integrate(routes) {
  if (this.options.isIntegrate) {
    routes.forEach(route => {
      route.path = prefix(route.path);

      if (this.options.mode === 'site' && route.meta?.nav) {
        route.meta.nav.path = prefix(route.meta.nav.path);
      }

      if (route.meta?.group) {
        route.meta.group.path = prefix(route.meta.group.path);
      }
    });
  }

  return routes;
} as RouteProcessor);
