import { useFullSidebarData, useLocale, useSiteData } from 'dumi';
import { useState } from 'react';
import type { NavItems, Navs, NavsWithMode } from './types';
import {
  pickRouteSortMeta,
  resolveNav,
  useLocaleDocRoutes,
  useRouteDataComparer,
} from './utils';

type INavData = Extract<NonNullable<Navs | NavsWithMode<Navs>>, Array<any>>;

/**
 * hook for get nav data
 */
export const useNavData = () => {
  const locale = useLocale();
  const routes = useLocaleDocRoutes();
  const { themeConfig } = useSiteData();
  const sidebar = useFullSidebarData();
  const sidebarDataComparer = useRouteDataComparer<INavData[0]>();
  const [nav] = useState<INavData>(() => {
    // use user config first
    let customNav: NavItems = [];
    let mode: NavsWithMode<Navs>['mode'] | undefined;
    if (themeConfig.nav) {
      mode = (themeConfig.nav as NavsWithMode<Navs>).mode;
      let nav: Navs;
      if (mode) {
        nav = (themeConfig.nav as NavsWithMode<Navs>).value;
      } else {
        nav = themeConfig.nav as Navs;
      }
      customNav = resolveNav(nav, locale);
      if (mode === 'override') return customNav;
    }

    // fallback to generate nav data from sidebar data
    const data = Object.entries(sidebar).map<INavData[0]>(([link, groups]) => {
      const meta = Object.values(routes).reduce<{
        title?: string;
        order?: number;
      }>((ret, route) => {
        // find routes which within the nav path
        if (route.path!.startsWith(link.slice(1))) {
          pickRouteSortMeta(ret, 'nav', route.meta!.frontmatter);
        }
        return ret;
      }, {});

      return {
        title: meta.title || groups[0].title || groups[0].children[0].title,
        order: meta.order || 0,
        link: groups[0].children[0].link,
        activePath: link,
      };
    });

    // TODO: 2-level nav data
    // 如果没有模式，说明类型为 Navs,那么沿用目前逻辑，若存在 nav,则直接用 nav 覆盖约定路由
    if (!mode)
      return [
        ...(themeConfig.nav
          ? resolveNav(themeConfig.nav as Navs, locale)
          : data),
      ].sort(sidebarDataComparer);
    if (mode === 'prepend')
      return customNav.concat(data.sort(sidebarDataComparer));
    return data.sort(sidebarDataComparer).concat(customNav);
  });

  return nav;
};
