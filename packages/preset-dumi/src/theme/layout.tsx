import React, { useLayoutEffect, useState } from 'react';
import { IRouteProps, IRouteComponentProps } from '@umijs/types';
// @ts-ignore
import config from '@@/dumi/config';
import AnchorLink from './components/AnchorLink';
import Context, { IThemeContext } from './context';
import { IMenu } from '../routes/getMenuFromRoutes';
import 'prismjs/themes/prism.css';
import 'katex/dist/katex.min.css';

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
}

export type IDumiRoutes = (IRouteProps & { meta?: any })[];

/**
 * hooks for get meta data of current route
 * @param routes    project route configurations
 * @param pathname  pathname of location
 */
const useCurrentRouteMeta = (routes: IDumiRoutes, pathname: string) => {
  const handler = (...args: [IDumiRoutes, string]) => {
    const pathWithoutSuffix = args[1].replace(/[^^]\/$/, '');

    return args[0].find(({ path }) => path === pathWithoutSuffix)?.meta || {};
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
    return args[0].find(locale => args[1].startsWith(locale.name))?.name || '*';
  };
  const [locale, setLocale] = useState<string>(handler(locales, pathname));

  useLayoutEffect(() => {
    setLocale(handler(locales, pathname));
  }, [pathname]);

  return locale;
};

/**
 * hooks for get menu data of current route
 * @param config    context config
 * @param locale    locale from current route
 * @param pathname  pathname of location
 */
const useCurrentMenu = (config: IThemeContext['config'], locale: string, pathname: string) => {
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
  const [menu, setMenu] = useState<IMenu['locale']['path']>(handler(config, locale, pathname));

  useLayoutEffect(() => {
    setMenu(handler(config, locale, pathname));
  }, [config.navs, config.menus, locale, pathname]);

  return menu;
};

/**
 * outer theme layout
 */
const OuterLayout: React.FC<IOuterLayoutProps & IRouteComponentProps> = props => {
  const { location, route, children } = props;
  const meta = useCurrentRouteMeta(route.routes, location.pathname);
  const locale = useCurrentLocale(config.locales, location.pathname);
  const menu = useCurrentMenu(config, locale, location.pathname);

  // scroll to anchor if hash exists
  useLayoutEffect(() => {
    if (location.hash) {
      AnchorLink.scrollToAnchor(location.hash.slice(1));
    }
  }, []);

  return (
    <Context.Provider
      value={{
        config,
        meta,
        locale,
        nav: config.navs[locale] || [],
        menu,
        base: !config.locales.length || locale === config.locales[0].name ? '/' : `/${locale}`,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default OuterLayout;
