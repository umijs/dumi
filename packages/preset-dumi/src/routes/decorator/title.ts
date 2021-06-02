import path from 'path';
import type { RouteProcessor } from '.';

/**
 * set title for route
 */
export default (function title(routes) {
  return routes.map(route => {
    // generate title if user did not configured
    if (!route.meta.title && typeof route.component === 'string') {
      let clearFilename = path.parse(route.component).name;

      // discard locale for component filename
      if (route.meta.locale) {
        clearFilename = clearFilename.replace(`.${route.meta.locale}`, '');
      }

      // button => Button
      route.meta.title = clearFilename.replace(/^[a-z]/, s => s.toUpperCase());

      // use nav or group name for index route
      if (clearFilename === 'index' && (route.meta.group?.title || route.meta.nav?.title)) {
        route.meta.title = route.meta.group?.title || route.meta.nav?.title;
      }
    }

    // apply meta title for umi routes
    route.title = route.meta.title;

    return route;
  });
} as RouteProcessor);
