import { useFullSidebarData, useLocale, useSiteData } from 'dumi';
import { useState } from 'react';
import type { IThemeConfig } from './types';
import {
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
    if (themeConfig.nav)
      return Array.isArray(themeConfig.nav)
        ? themeConfig.nav
        : themeConfig.nav[locale.id];

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

    return data.sort(sidebarDataComparer);
  });

  return nav;
};
