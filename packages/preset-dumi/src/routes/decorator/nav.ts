import { RouteProcessor } from '.';

export default (function nav(routes) {
  // only apply for site mode
  if (this.options.mode === 'site') {
    const defaultLocale = this.options.locales[0]?.[0];
    const userCustomNavTitles = {};

    routes.forEach(route => {
      const navPath = route.meta.nav?.path;

      if (!navPath) {
        let clearPath = route.path;

        // discard locale prefix
        if (route.meta.locale) {
          clearPath = clearPath.replace(`/${route.meta.locale}`, '');
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
          !route.meta.nav.path.startsWith(`/${route.meta.locale}`)
        ) {
          route.meta.nav.path = `/${route.meta.locale}${route.meta.nav.path}`;
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
          // fallback nav title by nav path
          route.meta.nav.path
            // discard locale prefix
            .replace(`/${route.meta.locale || ''}`, '')
            // discard start slash
            .replace(/^\//, '')
            // upper case the first english letter
            .replace(/^[a-z]/, s => s.toUpperCase());
      }
    });
  }

  return routes;
} as RouteProcessor);
