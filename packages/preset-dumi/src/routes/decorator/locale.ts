import path from 'path';
import slash from 'slash2';
import type { RouteProcessor } from '.';

/**
 * check route path wether prefix locale path
 * @param routePath   route path
 * @param localeName  locale prefix name
 */
export function isPrefixLocalePath(routePath: string, localeName: string) {
  return (
    routePath === `/${localeName}` || routePath.startsWith(`/${slash(path.join(localeName))}/`)
  );
}

/**
 * discard locale prefix path from route path
 * @param routePath   route path
 * @param localeName  locale prefix name
 */
export function discardLocalePrefix(routePath: string, localeName: string) {
  return localeName && isPrefixLocalePath(routePath, localeName)
    ? routePath.replace(`/${slash(path.join(localeName))}`, '')
    : routePath;
}

/**
 * add locale prefix for route path
 * @param routePath   route path
 * @param localeName  locale prefix name
 */
export function addLocalePrefix(routePath: string, localeName: string) {
  return `/${localeName}${routePath}`;
}

/**
 * set locale for route
 */
export default (function locale(routes) {
  this.data.locales = new Set([this.options.locales[0][0]]);

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
