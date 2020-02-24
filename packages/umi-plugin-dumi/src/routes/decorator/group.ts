import path from 'path';
import slash from 'slash2';
import { RouteProcessor } from '.';

/**
 * generate route group & update route path by group path
 */
export default (function group(routes) {
  return routes.map(route => {
    const defaultLocale = this.options.locales[0]?.[0];
    let groupPath: string = route.meta.group?.path;
    let groupTitle: string = route.meta.group?.title;
    let clearPath = route.path;

    if (route.meta.nav?.path) {
      // discard nav prefix (include locale prefix)
      clearPath = clearPath.replace(route.meta.nav.path, '');
    } else if (route.meta.locale) {
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

    // fallback group title if there only has group path
    if (groupPath && !groupTitle) {
      groupTitle = groupPath
        // discard start slash
        .replace(/^\//g, '')
        // upper case the first english letter
        .replace(/^[a-z]/, s => s.toUpperCase());
    }

    // set group path & group title
    if (groupPath || groupTitle) {
      route.meta.group = route.meta.group || {};

      if (groupPath) {
        // restore locale prefix or nav path
        if (route.meta.nav?.path) {
          groupPath = `${route.meta.nav.path}${groupPath}`;
        } else if (route.meta.locale && route.meta.locale !== defaultLocale) {
          groupPath = `/${route.meta.locale}${groupPath}`;
        }

        route.meta.group.path = groupPath;
      }

      if (groupTitle) {
        route.meta.group.title = groupTitle;

        // fallback group path if there only has group title (non-path type group)
        if (!groupPath && (route.meta.nav?.path || route.meta.locale)) {
          route.meta.group.path = route.meta.nav?.path || `/${route.meta.locale}`;
        }
      }
    }

    // correct route path by new group path
    if (route.meta.group?.path && route.path !== route.meta.group.path) {
      route.path = slash(path.join(route.meta.group.path, clearPath.match(/([^/]*)$/)[1]));
    }

    return route;
  });
} as RouteProcessor);
