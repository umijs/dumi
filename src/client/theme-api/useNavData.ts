import { useFullSidebarData, useLocale, useSiteData } from 'dumi';
import { useState } from 'react';
import type { INavItems, IUserNavItems, IUserNavMode } from './types';
import {
  getLocaleNav,
  pickRouteSortMeta,
  useLocaleDocRoutes,
  useRouteDataComparer,
} from './utils';

/**
 * hook for get nav data
 */
export const useNavData = () => {
  const locale = useLocale();
  const routes = useLocaleDocRoutes();
  const { themeConfig } = useSiteData();
  const sidebar = useFullSidebarData();
  const sidebarDataComparer = useRouteDataComparer<INavItems[0]>();
  const [nav] = useState<INavItems>(() => {
    // use user config first
    let userNavValue: IUserNavItems = [];
    let mode: IUserNavMode | undefined;
    if (themeConfig.nav) {
      // 形如：{mode: "append", value: []}
      if (
        'mode' in themeConfig.nav &&
        typeof themeConfig.nav.mode === 'string'
      ) {
        mode = themeConfig.nav.mode;
        userNavValue = getLocaleNav(themeConfig.nav.value, locale);
      } else if (!('mode' in themeConfig.nav)) {
        // 形如：[] 或 {"zh-CN": []}
        userNavValue = getLocaleNav(themeConfig.nav, locale);
      }
      if (!mode || mode === 'override') return userNavValue;
    }

    // fallback to generate nav data from sidebar data
    const data = Object.entries(sidebar).map<INavItems[0]>(([link, groups]) => {
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
