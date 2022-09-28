import { useFullSidebarData, useSiteData } from 'dumi';
import { useState } from 'react';
import type { IThemeConfig } from './types';
import { useLocaleDocRoutes } from './utils';

/**
 * hook for get nav data
 */
export const useNavData = () => {
  const routes = useLocaleDocRoutes();
  const { themeConfig } = useSiteData();
  const sidebar = useFullSidebarData();
  const [nav] = useState<NonNullable<IThemeConfig['nav']>>(() => {
    // use user config first
    if (themeConfig.nav) return themeConfig.nav;

    // fallback to generate nav data from sidebar data
    const data = Object.entries(sidebar).map<
      NonNullable<IThemeConfig['nav']>[0]
    >(([link, groups]) => {
      const meta = Object.values(routes).reduce<{
        title?: string;
        order?: number;
      }>((ret, route) => {
        // find routes which within the nav path
        if (route.path!.startsWith(link.slice(1))) {
          switch (typeof route.meta!.frontmatter.nav) {
            case 'object':
              ret.title = route.meta!.frontmatter.nav.title || ret.title;
              ret.order = route.meta!.frontmatter.nav.order ?? ret.order;
              break;

            case 'string':
              ret.title = route.meta!.frontmatter.nav || ret.title;
              break;

            default:
          }
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

    return data.sort(
      (a, b) => a.order - b.order || a.title?.localeCompare(b.title),
    );
  });

  return nav;
};
