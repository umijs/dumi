import path from 'path';
import slash from 'slash2';
import { isPrefixLocalePath, discardLocalePrefix, addLocalePrefix } from './locale';
import { getRouteComponentDirs } from './nav';
import type { RouteProcessor } from '.';

/**
 * generate route group & update route path by group path
 */
export default (function group(routes) {
  const userCustomGroupTitles = {};

  routes.map(route => {
    const defaultLocale = this.options.locales[0][0];
    let groupPath: string = route.meta.group?.path;
    const groupTitle: string = route.meta.group?.title;
    let clearPath = route.path;

    if (route.meta.nav?.path) {
      // discard nav prefix (include locale prefix)
      clearPath = clearPath.replace(route.meta.nav.path, '');
    }

    if (route.meta.locale) {
      // discard locale prefix
      clearPath = discardLocalePrefix(clearPath, route.meta.locale);
    }

    // generate group if user did not customized group via frontmatter
    if (!groupPath) {
      const parsed = path.parse(path.relative(this.umi.paths.cwd, route.component) as string);
      const isEntryMd = new RegExp(
        `^(index|readme)(\\.(${this.options.locales.map(([name]) => name).join('|')}))?$`,
        'i',
      ).test(parsed.name);

      // only process nested route
      if (
        // at least 2-level path
        (clearPath && clearPath.lastIndexOf('/') !== 0) ||
        // or component filename is the default entry
        (parsed && clearPath.length > 1 && isEntryMd)
      ) {
        groupPath = clearPath.match(/^([^]+?)(\/[^/]+)?$/)[1];
        clearPath = clearPath.replace(groupPath, '');
      }

      // add fallback flag for menu generator
      // for support group different 1-level md by group.title, without group.path
      if ((!clearPath || (!clearPath.lastIndexOf('/') && !isEntryMd)) && groupTitle) {
        route.meta.group.__fallback = true;
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
        !isPrefixLocalePath(groupPath, route.meta.locale)
      ) {
        groupPath = addLocalePrefix(groupPath, route.meta.locale);
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
      // use other same group path title first
      route.meta.group.title = userCustomGroupTitles[route.meta.group.path];

      // fallback use directory name
      if (!route.meta.group.title) {
        // discard first level dir if there has nav title
        const dirs = getRouteComponentDirs(route.component, this).slice(route.meta.nav ? 1 : 0);

        route.meta.group.title =
          // use second dir as group title
          dirs.shift()?.replace(/^[a-z]/, s => s.toUpperCase()) ||
          // then use nav title
          route.meta.nav?.title ||
          // fallback group title if there only has group path
          route.meta.group.path
            // discard nav prefix path or locale prefix path
            .replace(route.meta.nav?.path || `/${route.meta.locale || ''}`, '')
            // discard start slash
            .replace(/^\//g, '')
            // upper case the first english letter
            .replace(/^[a-z]/, s => s.toUpperCase());
      }
    }
  });

  return routes;
} as RouteProcessor);
