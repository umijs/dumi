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

    // generate group if user did not customized group via frontmatter
    if (!groupPath) {
      const filePath = route.component as string;
      const parsed = path.parse(filePath);

      // discard locale prefix
      if (route.meta.locale) {
        clearPath = clearPath.replace(`/${route.meta.locale}`, '');
      }

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

    // add locale for group path
    if (groupPath && route.meta.locale && route.meta.locale !== defaultLocale) {
      groupPath = `/${route.meta.locale}${groupPath}`;
    }

    // set group path & group title
    if (groupPath || groupTitle) {
      route.meta.group = route.meta.group || {};

      if (groupPath) {
        route.meta.group.path = groupPath;
      }

      if (groupTitle) {
        route.meta.group.title = groupTitle;
      }
    }

    // correct route path by new group path
    if (route.meta.group?.path && route.path !== route.meta.group.path) {
      route.path = slash(path.join(route.meta.group.path, clearPath.match(/([^/]*)$/)[1]));
    }

    return route;
  });
} as RouteProcessor);
