import type { RouteProcessor } from '.';

/**
 * hide specific doc in production mode
 */
export default (function hide(routes) {
  if (this.umi.env === 'production') {
    return routes.filter(route => route.meta.hide !== true);
  }

  return routes;
} as RouteProcessor);
