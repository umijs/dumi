import fs from 'fs';
import path from 'path';
import { IRoute, IApi } from 'umi-types';
import deepmerge from 'deepmerge';
import slash from 'slash2';
import getFrontMatter from './getFrontMatter';
import { IFatherDocOpts } from '../';

function getLocaleFromFilepath(filepath: string, locales: IFatherDocOpts['locales']) {
  const guessLocale = path.parse(filepath).name.match(/[^.]+$/)?.[0];

  return (guessLocale && locales.find(([name]) => name === guessLocale)) ? guessLocale : null;
}

function discardLocaleForPath(pathname: string, locale: string) {
  return pathname.replace(`/${locale}`, '') || '/';
}

function discardLocaleForFilename(filename: string, locale: string) {
  return filename.replace(`.${locale}`, '');
}

function replaceLocaleForPath(pathname: string, prevLocale: string | undefined, nextLocale: string) {
  const oPath = prevLocale ? discardLocaleForPath(pathname, prevLocale) : pathname;

  return `/${nextLocale}${oPath}`.replace(/\/$/, '');
}

function isNestedRoute(routePath: string, componentPath: any, locales: IFatherDocOpts['locales']) {
  const parsed = typeof componentPath === 'string' ? path.parse(componentPath) : null;

  return (
    // at least 2-level path
    routePath.lastIndexOf('/') !== 0 ||
    // or component filename is the default entry
    (
      parsed &&
      routePath.length > 1 &&
      (new RegExp(`^(index|readme)(\\.(${
        locales.map(([name]) => name).join('|')
      }))?$`, 'i')).test(parsed.name)
    )
  );
}

/**
 * make standard umi routes can be used by father-doc
 * @note  route will be decorated the following contents:
 *        - add meta from fallback meta & frontmatter
 *        - add title field & TitleWrapper to display page title
 *        - correct route path by group path (replace prefix)
 *        - flat child routes to the top-level routes
 *        - add index routes for group which has no index route
 */
export default function decorateRoutes(
  routes: IRoute[],
  paths: IApi['paths'],
  opts: IFatherDocOpts,
  parentRoute?: IRoute,
) {
  const redirects: { [key: string]: IRoute } = {};
  const defaultLocale = opts.locales[0]?.[0];
  const validLocales = new Set<string>([defaultLocale]);
  const result = routes.reduce((total, route) => {
    const frontMatter = typeof route.component === 'string' ? getFrontMatter(route.component) : {};
    const locale = typeof route.component === 'string' ? getLocaleFromFilepath(route.component, opts.locales) : '';
    const pathWithoutLocale = discardLocaleForPath(route.path, locale);
    const fallbackMeta: any = {};

    // generate fallback group meta for nest route
    if (isNestedRoute(pathWithoutLocale, route.component, opts.locales)) {
      const groupPath = pathWithoutLocale.match(/^([^]+?)(\/[^/]+)?$/)[1];

      fallbackMeta.group = {
        path: groupPath,
      };
    }

    // set fallback title for route
    if (typeof route.component === 'string') {
      // index.zh-CN => Index
      fallbackMeta.title = discardLocaleForFilename(
        path.parse(route.component).name,
        locale,
      ).replace(/^[a-z]/, s => s.toUpperCase());
    }

    // merge meta for route
    route.meta = deepmerge(
      fallbackMeta,
      frontMatter,
      (route.meta || {}), // allow user override meta via configuration routes
    );

    // set locale for route
    if (locale) {
      route.meta.locale = locale;
      validLocales.add(locale);

      // prefix group path
      if (route.meta.group?.path && locale !== defaultLocale) {
        route.meta.group.path = `/${locale}${route.meta.group.path}`;
      }
    }

    // fallback group title if there only has group path
    if(route.meta.group?.path && !route.meta.group.title) {
      // /zh-CN/abc => Abc
      route.meta.group.title = discardLocaleForPath(route.meta.group.path, locale)
        // discard start slash
        .replace(/^\//g, '')
        // upper case the first english letter
        .replace(/^[a-z]/, s => s.toUpperCase());
    }

    // apply meta title
    route.title = route.meta.title;

    // apply TitleWrapper
    // see also: https://github.com/umijs/umi/blob/master/packages/umi-plugin-react/src/plugins/title/index.js#L37
    route.Routes = route.Routes || [];
    route.Routes.push(
      `./${slash(path.relative(paths.cwd, path.join(paths.absTmpDirPath, './TitleWrapper.jsx')))}`,
    );

    // unshift to Routes if parent route has component
    if (typeof parentRoute?.component === 'string') {
      route.Routes.unshift(parentRoute.component);
    }

    // correct route path by group path
    if (route.meta.group?.path && route.path !== route.meta.group.path) {
      route.path = slash(path.join(route.meta.group.path, pathWithoutLocale.match(/([^/]*)$/)[1]));
    }

    // flat child routes
    if (route.routes) {
      total.push(...decorateRoutes(route.routes, paths, opts, route));
    } else {
      total.push(route);
    }

    return total;
  }, [] as IRoute[]);

  // fallback to default locale if there has no translation for other locales
  {
    const fallbackLocalRoutes = [];

    // fallback to readme if there has no index route
    validLocales.forEach(locale => {
      const localeRootPath = locale === defaultLocale ? '/' : `/${locale}`;
      const localeFileAddon = locale === defaultLocale ? '' : `.${locale}`;

      if (!result.some(route => route.path === localeRootPath)) {
        const readmePath = path.join(paths.cwd, `README${localeFileAddon}.md`);

        if (fs.existsSync(readmePath)) {
          result.unshift({
            path: localeRootPath,
            component: `./README${localeFileAddon}.md`,
            exact: true,
            meta: {
              locale,
              title: 'README',
              order: Infinity, // keep readme on the top
            },
            title: 'README',
          });
        }
      }
    });

    // fallback remaining non-default-locale routes
    validLocales.forEach(locale => {
      const currentLocalePrefix = `/${locale}`;

      // do not deal with default locale
      if (defaultLocale && locale !== defaultLocale) {
        result.forEach(({ path: routePath, ...routeProps }) => {
          const currentLocalePath = replaceLocaleForPath(
            routePath,
            routeProps.meta.locale,
            locale
          );

          // deal with every default route (without locale prefix)
          if (
            !routePath.startsWith(currentLocalePrefix) &&
            !result.some(route => route.path === currentLocalePath)
          ) {
            const fallbackRoute = deepmerge({
              path: currentLocalePath,
            }, routeProps);

            fallbackRoute.meta.locale = locale;

            // replace locale prefix for group path
            if (fallbackRoute.meta.group) {
              fallbackRoute.meta.group.path = replaceLocaleForPath(
                fallbackRoute.meta.group.path,
                routeProps.meta.locale,
                locale
              );
            }

            fallbackLocalRoutes.push(fallbackRoute);
          }
        });
      }
    });

    result.push(...fallbackLocalRoutes);
  }

  result.forEach((route) => {
    // add index route redirect for group which has no index route
    if (
      route.meta.group?.path &&
      !redirects[route.meta.group.path] &&
      !result.some(item => item.path === route.meta.group.path)
    ) {
      const { title, path, ...resGroupMeta } = route.meta.group;

      redirects[path] = {
        path,
        meta: {
          ...resGroupMeta
        },
        exact: true,
        redirect: result.find(item => item.meta.group?.path === route.meta.group.path).path,
      };
    }

    // append redirect for legacy path
    if (route.meta.legacy) {
      redirects[route.meta.legacy] = {
        path: route.meta.legacy,
        exact: true,
        redirect: route.path,
      };
    }
  });

  return result.concat(Object.values(redirects));
}
