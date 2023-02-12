import { useFullSidebarData, useLocale, useSiteData } from 'dumi';
import { useState } from 'react';
import type { INavItems, INavs, NavsWithMode } from './types';
import {
  getLocaleNav,
  pickRouteSortMeta,
  useLocaleDocRoutes,
  useRouteDataComparer,
} from './utils';

type INavData = Extract<NonNullable<INavs | NavsWithMode<INavs>>, Array<any>>;

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
    let userNavValue: INavItems = [];
    let mode: NavsWithMode<INavs>['mode'] | undefined;
    if (themeConfig.nav) {
      mode = (themeConfig.nav as NavsWithMode<INavs>).mode;
      const value =
        'mode' in themeConfig.nav ? themeConfig.nav.value : themeConfig.nav;
      userNavValue = getLocaleNav(value as INavs, locale);
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
