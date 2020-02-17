import { RouteProcessor } from '.';

export default (function nav(routes) {
  // only apply for site mode
  if (this.options.mode === 'site') {
    const defaultLocale = this.options.locales[0]?.[0];

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
        // generate nav title by nav path
        if (!route.meta.nav.title) {
          route.meta.nav.title =
            route.title ||
            route.meta.nav.path
              // discard start slash
              .replace(/^\//g, '')
              // upper case the first english letter
              .replace(/^[a-z]/, s => s.toUpperCase());
        }

        // add locale prefix for nav path
        if (route.meta.locale && route.meta.locale !== defaultLocale) {
          route.meta.nav.path = `/${route.meta.locale}${route.meta.nav.path}`;
        }
      }
    });
  }

  return routes;
} as RouteProcessor);
