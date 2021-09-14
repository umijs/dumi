import React, { useLayoutEffect, useState } from 'react';
import type { IRouteProps, IRouteComponentProps } from '@umijs/types';
// @ts-ignore
import config from '@@/dumi/config';
import type { IThemeContext } from './context';
import Context from './context';
import type { IMenu } from '../routes/getMenuFromRoutes';

export interface IOuterLayoutProps {
  mode: IThemeContext['config']['mode'];
  title: IThemeContext['config']['title'];
  logo: IThemeContext['config']['logo'];
  description: IThemeContext['config']['description'];
  repository: IThemeContext['config']['repository'];
  navs: IThemeContext['config']['navs'];
  menus: IThemeContext['config']['menus'];
  locales: IThemeContext['config']['locales'];
  algolia: IThemeContext['config']['algolia'];
  routes: IThemeContext['routes'];
}

/**
 * hooks for get meta data of current route
 * @param routes    project route configurations
 * @param pathname  pathname of location
 */
const useCurrentRouteMeta = (routes: IOuterLayoutProps['routes'], pathname: string) => {
  const handler = (...args: [IOuterLayoutProps['routes'], string]) => {
    const pathWithoutSuffix = args[1].replace(/([^^])\/$/, '$1');

    return ({
      ...(args[0].find(({ path }) => path === pathWithoutSuffix)?.meta || {}),
      __pathname: pathname,
    });
  };
  const [meta, setMeta] = useState<IThemeContext['meta']>(handler(routes, pathname));

  useLayoutEffect(() => {
    setMeta(handler(routes, pathname));
  }, [pathname]);

  return meta;
};

/**
 * hooks for get locale from current route
 * @param locales   project locale configurations
 * @param pathname  pathname of location
 */
const useCurrentLocale = (locales: IThemeContext['config']['locales'], pathname: string) => {
  const handler = (...args: [IThemeContext['config']['locales'], string]) => {
    // get locale by route prefix
    return args[0].find(locale => new RegExp(`/${locale.name}(/|$)`).test(args[1]))?.name || locales[0].name;
  };
  const [locale, setLocale] = useState<string>(handler(locales, pathname));

  useLayoutEffect(() => {
    setLocale(handler(locales, pathname));
  }, [pathname]);

  return locale;
};

/**
 * hooks for get menu data of current route
 * @param ctxConfig context config
 * @param locale    locale from current route
 * @param pathname  pathname of location
 */
const useCurrentMenu = (ctxConfig: IThemeContext['config'], locale: string, pathname: string) => {
  const handler = (...args: [IThemeContext['config'], string, string]) => {
    const navs = args[0].navs[args[1]] || [];
    let navPath = '*';

    // find nav in reverse way to fallback to the first nav
    for (let i = navs.length - 1; i >= 0; i -= 1) {
      const nav = navs[i];
      const items = [nav].concat(nav.children).filter(Boolean);
      const matched = items.find(
        item =>
          item.path && new RegExp(`^${item.path.replace(/\.html$/, '')}(/|\.|$)`).test(args[2]),
      );

      if (matched) {
        navPath = matched.path;
        break;
      }
    }

    return args[0].menus[args[1]]?.[navPath] || [];
  };
  const [menu, setMenu] = useState<IMenu['locale']['path']>(handler(ctxConfig, locale, pathname));

  useLayoutEffect(() => {
    setMenu(handler(ctxConfig, locale, pathname));
  }, [ctxConfig.navs, ctxConfig.menus, locale, pathname]);

  return menu;
};

/**
 * hooks for doc base route path
 * @param locale    current locale
 * @param locales   project locale configurations
 * @param route     layout route configurations
 * @note  handle these points:
 *          1. locale prefix, such as empty or /zh-CN
 *          2. integrate mode route prefix, such as /~docs or /~docs/zh-CN
 */
const useCurrentBase = (
  locale: string,
  locales: IThemeContext['config']['locales'],
  route: IRouteProps,
) => {
  const handler = (...args: [string, IThemeContext['config']['locales'], IRouteProps]) => {
    if (args[0] === args[1][0].name) {
      // use layout route path as base in default locale
      return args[2].path;
    }

    // join layout route path & locale prefix in other locale
    return `${route.path}/${locale}`.replace(/\/\//, '/');
  };
  const [base, setBase] = useState<string>(handler(locale, locales, route));

  useLayoutEffect(() => {
    setBase(handler(locale, locales, route));
  }, [locale]);

  return base;
};

const findDumiRoot = (routes: any): IThemeContext['routes'] => {
  return routes.find(item => {
    if (item.__dumiRoot) {
      return true;
    }
    if (item.routes) {
      return findDumiRoot(item.routes);
    }
    return false;
  })?.routes;
};

/**
 * outer theme layout
 */
const OuterLayout: React.FC<IOuterLayoutProps & IRouteComponentProps> = props => {
  const { location, route, children } = props;
  const pathWithoutPrefix = location.pathname.replace(
    // to avoid stripped the first /
    route.path.replace(/^\/$/, '//'),
    '',
  );
  const routes = findDumiRoot(props.routes) || [];
  const meta = useCurrentRouteMeta(routes, location.pathname);
  // use non-prefix for detect current locale, such as /~docs/en-US -> /en-US
  const locale = useCurrentLocale(config.locales, pathWithoutPrefix);
  const menu = useCurrentMenu(config, locale, location.pathname);
  const base = useCurrentBase(locale, config.locales, route);

  return (
    <Context.Provider
      value={{
        config,
        meta: meta.__pathname === location.pathname ? meta : {} as any,
        locale,
        nav: config.navs[locale] || [],
        menu,
        base,
        routes,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default OuterLayout;
