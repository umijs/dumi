import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import deepmerge from 'deepmerge';
import { isPrefixLocalePath, discardLocalePrefix, addLocalePrefix } from './locale';
import getFrontMatter from '../getFrontMatter';
import type { RouteProcessor } from '.';

function replaceLocaleForPath(
  pathname: string,
  prevLocale: string | undefined,
  nextLocale: string,
) {
  const oPath = prevLocale ? discardLocalePrefix(pathname, prevLocale) : pathname;

  return addLocalePrefix(oPath, nextLocale).replace(/\/$/, '');
}

/**
 * generate fallback routes for missing locales
 */
export default (function fallback(routes) {
  const defaultLocale = this.options.locales[0][0];
  const fallbacks = [];

  // for missing locale routes
  this.data.locales.forEach(locale => {
    const localePrefix = locale === defaultLocale ? '/' : `/${locale}`;

    // fallback root route path to README.md for each locale
    if (!routes.some(route => route.path === localePrefix)) {
      const localeFileAddon = locale === defaultLocale ? '' : `.${locale}`;
      const readmePath = slash(path.join(this.umi.paths.cwd, `README${localeFileAddon}.md`));

      if (fs.existsSync(readmePath)) {
        const component = `./README${localeFileAddon}.md`;
        const frontMatter = getFrontMatter(readmePath);

        routes.unshift({
          path: localePrefix,
          component,
          exact: true,
          meta: {
            locale,
            order: -Infinity, // keep readme on the top
            ...frontMatter, // use custom front matter
          },
          title: frontMatter.title,
        });
      }
    }

    // do not deal with default locale for remaining non-default-locale routes
    if (localePrefix !== '/') {
      routes.forEach(({ path: routePath, ...routeProps }) => {
        const currentLocalePath = replaceLocaleForPath(routePath, routeProps.meta.locale, locale);

        // deal with every default route (without locale prefix)
        if (
          !isPrefixLocalePath(routePath, locale) &&
          !routes.some(route => route.path === currentLocalePath)
        ) {
          const fallbackRoute = deepmerge(
            {
              path: currentLocalePath,
            },
            routeProps,
          );

          fallbackRoute.meta.locale = locale;

          // replace locale prefix for group path
          if (fallbackRoute.meta.group?.path) {
            fallbackRoute.meta.group.path = replaceLocaleForPath(
              fallbackRoute.meta.group.path,
              routeProps.meta.locale,
              locale,
            );

            // correct group title from brother group route
            if (fallbackRoute.meta.group?.title) {
              const brotherRoute = routes.find(
                route =>
                  route.meta.group?.path === fallbackRoute.meta.group.path &&
                  route.meta.locale === fallbackRoute.meta.locale,
              );

              if (brotherRoute) {
                fallbackRoute.meta.group.title = brotherRoute.meta.group.title;
              }
            }
          }

          // replace locale prefix for nav path
          if (fallbackRoute.meta.nav?.path) {
            fallbackRoute.meta.nav.path = replaceLocaleForPath(
              fallbackRoute.meta.nav.path,
              routeProps.meta.locale,
              locale,
            );

            // correct group title from brother group route
            if (fallbackRoute.meta.nav?.title) {
              const brotherRoute = routes.find(
                route =>
                  route.meta.nav?.path === fallbackRoute.meta.nav.path &&
                  route.meta.locale === fallbackRoute.meta.locale,
              );

              if (brotherRoute) {
                fallbackRoute.meta.nav.title = brotherRoute.meta.nav.title;
              }
            }
          }

          fallbacks.push(fallbackRoute);
        }
      });
    }
  });

  return routes.concat(fallbacks);
} as RouteProcessor);
