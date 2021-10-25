import path from 'path';
import { winPath } from '@umijs/utils';
import { isPrefixLocalePath, discardLocalePrefix, addLocalePrefix } from './locale';
import type { RouteProcessor } from '.';

/**
 * get parent directories for route component
 * @param component   route component path
 * @param ctx         processor ctx
 */
export function getRouteComponentDirs(component: string, ctx: ThisParameterType<RouteProcessor>) {
  // remove ./ for include paths & component path
  const clearIncludes = ctx.options.resolve.includes.map(item => {
    const relativePath = path.isAbsolute(item) ? path.relative(ctx.umi?.cwd || process.cwd(), item) : item;
    return `${winPath(path.join(relativePath))}/`;
  });
  const clearComponentPath = winPath(path.join(component));

  // find include path for current component path
  const entryIncludePath = clearIncludes.find(item => clearComponentPath.startsWith(item));

  // extract component directories and split
  return winPath(path.dirname(clearComponentPath.replace(entryIncludePath, '')).replace(/^\./, '')).split('/');
}

export default (function nav(routes) {
  // only apply for site mode
  if (this.options.mode === 'site') {
    const defaultLocale = this.options.locales[0][0];
    const userCustomNavTitles = {};

    routes.forEach(route => {
      const navPath = route.meta.nav?.path;

      if (!navPath) {
        let clearPath = route.path;

        // discard locale prefix
        if (route.meta.locale) {
          clearPath = discardLocalePrefix(clearPath, route.meta.locale);
        }

        if (clearPath && clearPath !== '/') {
          route.meta.nav = {
            ...(route.meta.nav || {}),
            // use the first sub path as nav path
            path: `/${clearPath.split('/')[1]}`,
          };
        }
      }

      if (route.meta.nav?.path) {
        // add locale prefix for nav path
        if (
          route.meta.locale &&
          route.meta.locale !== defaultLocale &&
          !isPrefixLocalePath(route.meta.nav.path, route.meta.locale)
        ) {
          route.meta.nav.path = addLocalePrefix(route.meta.nav.path, route.meta.locale);
        }

        // save user cusomize nav title, then will use for other route
        if (route.meta.nav.title) {
          userCustomNavTitles[route.meta.nav.path] = route.meta.nav.title;
        }
      }
    });

    // fallback navs title
    routes.forEach(route => {
      if (route.meta.nav?.path && !route.meta.nav.title) {
        route.meta.nav.title =
          // use other same nav path title first
          userCustomNavTitles[route.meta.nav.path] ||
          // then use first directory name
          getRouteComponentDirs(route.component, this).shift()?.replace(/^[a-z]/, s => s.toUpperCase()) ||
          // fallback nav title by nav path
          // discard locale prefix
          discardLocalePrefix(route.meta.nav.path, route.meta.locale)
            // discard start slash
            .replace(/^\//, '')
            // upper case the first english letter
            .replace(/^[a-z]/, s => s.toUpperCase());
      }
    });
  }

  return routes;
} as RouteProcessor);
