import path from 'path';
import { RouteProcessor } from '.';

/**
 * set locale for route
 */
export default (function locale(routes) {
  this.data.locales = new Set([this.options.locales[0]?.[0]]);

  return routes.map(route => {
    // guess filename has locale suffix, eg: index.zh-CN
    const locale = path.parse(route.component as string).name.match(/[^.]+$/)?.[0];

    // valid locale
    if (locale && this.options.locales.find(([name]) => name === locale)) {
      route.meta.locale = locale;

      // share locale list for other processor
      this.data.locales.add(locale);
    }

    return route;
  });
} as RouteProcessor);
