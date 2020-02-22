import path from 'path';
import { RouteProcessor } from '.';

/**
 * set locale for route
 */
export default (function locale(routes) {
  this.data.locales = new Set([this.options.locales[0]?.[0]]);

  return routes.map(route => {
    // guess filename has locale suffix, eg: index.zh-CN
    const pathLocale = path.parse(route.component as string).name.match(/[^.]+$/)?.[0];

    // valid locale
    if (pathLocale && this.options.locales.find(([name]) => name === pathLocale)) {
      route.meta.locale = pathLocale;

      // share locale list for other processor
      this.data.locales.add(pathLocale);
    }

    return route;
  });
} as RouteProcessor);
