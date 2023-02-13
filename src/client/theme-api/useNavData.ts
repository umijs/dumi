import { useFullSidebarData, useLocale, useSiteData } from 'dumi';
import { useState } from 'react';
import type { INav, IThemeConfig, IUserNavItems, NavWithMode } from './types';
import {
  getLocaleNav,
  pickRouteSortMeta,
  useLocaleDocRoutes,
  useRouteDataComparer,
} from './utils';

type INavData = Extract<NonNullable<IThemeConfig['nav']>, Array<any>>;

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
    let userNavValue: IUserNavItems = [];
    let mode: NavWithMode<INav>['mode'] | undefined;
    if (themeConfig.nav) {
      let value;
      // 形如：{mode: "append", value: []}
      if (
        'mode' in themeConfig.nav &&
        typeof themeConfig.nav.mode === 'string'
      ) {
        mode = themeConfig.nav.mode;
        value = themeConfig.nav.value;
        userNavValue = getLocaleNav(value, locale);
      } else if (!('mode' in themeConfig.nav)) {
        // 形如：[] 或 {"zh-CN": []}
        value = themeConfig.nav;
        userNavValue = getLocaleNav(value, locale);
      }
      if (!mode || mode === 'override') return userNavValue;
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

    data.sort(sidebarDataComparer);
    // TODO: 2-level nav data
    if (mode === 'prepend') data.unshift(...userNavValue);
    else if (mode === 'append') data.push(...userNavValue);

    return data;
  });

  return nav;
};
