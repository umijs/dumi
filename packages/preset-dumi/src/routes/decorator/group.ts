import path from 'path';
import slash from 'slash2';
import { RouteProcessor } from '.';

/**
 * generate route group & update route path by group path
 */
export default (function group(routes) {
  const userCustomGroupTitles = {};

  routes.map(route => {
    const defaultLocale = this.options.locales[0]?.[0];
    let groupPath: string = route.meta.group?.path;
    let groupTitle: string = route.meta.group?.title;
    let clearPath = route.path;

    if (route.meta.nav?.path) {
      // discard nav prefix (include locale prefix)
      clearPath = clearPath.replace(route.meta.nav.path, '');
    }

    if (route.meta.locale) {
      // discard locale prefix
      clearPath = clearPath.replace(`/${route.meta.locale}`, '');
    }

    // generate group if user did not customized group via frontmatter
    if (!groupPath) {
      const parsed = path.parse(route.component as string);

      // only process nested route
      if (
        // at least 2-level path
        (clearPath && clearPath.lastIndexOf('/') !== 0) ||
        // or component filename is the default entry
        (parsed &&
          clearPath.length > 1 &&
          new RegExp(
            `^(index|readme)(\\.(${this.options.locales.map(([name]) => name).join('|')}))?$`,
            'i',
          ).test(parsed.name))
      ) {
        groupPath = clearPath.match(/^([^]+?)(\/[^/]+)?$/)[1];
        clearPath = clearPath.replace(groupPath, '');
      }
    }

    // set group path
    if (groupPath) {
      route.meta.group = route.meta.group || {};

      // restore locale prefix or nav path
      if (route.meta.nav?.path && !groupPath.startsWith(route.meta.nav.path)) {
        groupPath = `${route.meta.nav.path}${groupPath}`;
      } else if (
        route.meta.locale &&
        route.meta.locale !== defaultLocale &&
        !groupPath.startsWith(`/${route.meta.locale}`)
      ) {
        groupPath = `/${route.meta.locale}${groupPath}`;
      }

      // save user cusomize group title, then will use for other route
      if (groupTitle) {
        userCustomGroupTitles[groupPath] = groupTitle;
      }

      route.meta.group.path = groupPath;
    } else if (groupTitle && (route.meta.nav?.path || route.meta.locale)) {
      // fallback group path if there only has group title (non-path type group)
      route.meta.group.path = route.meta.nav?.path || `/${route.meta.locale}`;
    }

    // correct route path by new group path
    if (route.meta.group?.path && route.path !== route.meta.group.path) {
      route.path = slash(path.join(route.meta.group.path, clearPath.match(/([^/]*)$/)[1]));
    }

    return route;
  });

  // fallback groups title
  routes.forEach(route => {
    if (route.meta.group?.path && !route.meta.group.title) {
      route.meta.group.title =
        // use other same group path title first
        userCustomGroupTitles[route.meta.group.path] ||
        // fallback group title if there only has group path
        route.meta.group.path
          // discard nav prefix path or locale prefix path
          .replace(route.meta.nav?.path || `/${route.meta.locale || ''}`, '')
          // discard start slash
          .replace(/^\//g, '')
          // upper case the first english letter
          .replace(/^[a-z]/, s => s.toUpperCase());
    }
  });

  return routes;
} as RouteProcessor);
