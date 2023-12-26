import { useFullSidebarData, useLocale, useSiteData } from 'dumi';
import { useState } from 'react';
import type {
  INavItems,
  ISidebarGroup,
  IUserNavItems,
  IUserNavMode,
} from './types';
import { getLocaleClearPath, getRouteParentPath } from './useSidebarData';
import {
  getLocaleNav,
  pickRouteSortMeta,
  useLocaleDocRoutes,
  useRouteDataComparer,
} from './utils';

type INavSortMeta = Partial<Pick<INavItems[0], 'order' | 'title'>>;

function genNavItem(
  meta: INavSortMeta,
  groups: ISidebarGroup[],
  activePath: string,
  link?: string,
): INavItems[0] {
  return {
    title: meta.title || groups[0].title || groups[0].children[0].title,
    order: meta.order || 0,
    activePath: activePath,
    ...(link ? { link } : {}),
  };
}

/**
 * hook for get nav data
 */
export const useNavData = () => {
  const locale = useLocale();
  const routes = useLocaleDocRoutes();
  const { themeConfig, _2_level_nav_available: is2LevelNav } = useSiteData();
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
    const data = Object.values(
      Object.entries(sidebar)
        // make sure shallow nav item before deep
        .sort(([a], [b]) => a.split('/').length - b.split('/').length)
        // convert sidebar data to nav data
        .reduce<Record<string, INavItems[0]>>((ret, [link, groups]) => {
          const clearPath = getLocaleClearPath(link.replace(/^\//, ''), locale);
          const parentPath = link.replace(clearPath, (s) =>
            getRouteParentPath(s, { is2LevelNav, locale }),
          );
          const isNestedNav = link.length > parentPath.length && is2LevelNav;
          const [firstMeta, secondMeta] = Object.values(routes).reduce<
            {
              title?: string;
              order?: number;
            }[]
          >(
            (ret, route) => {
              // find routes which within the nav path
              if (route.path!.startsWith(link.slice(1))) {
                pickRouteSortMeta(ret[0], 'nav', route.meta!.frontmatter);
                // generate parent meta for nested nav
                if (isNestedNav)
                  pickRouteSortMeta(
                    ret[1],
                    'nav.second',
                    route.meta!.frontmatter,
                  );
              }
              return ret;
            },
            [{}, {}],
          );

          if (isNestedNav) {
            // fallback to use parent path as 1-level nav title
            firstMeta.title ??= parentPath
              .split('/')
              .pop()!
              .replace(/^[a-z]/, (s) => s.toUpperCase());

            // handle nested nav item as parent children
            const second = (ret[parentPath] ??= genNavItem(
              firstMeta,
              groups,
              parentPath,
            ));

            second.children ??= [];
            second.children!.push(
              genNavItem(secondMeta, groups, link, groups[0].children[0].link),
            );
          } else {
            // handle root nav item
            ret[link] = genNavItem(
              firstMeta,
              groups,
              link,
              groups[0].children[0].link,
            );
          }

          return ret;
        }, {}),
    );

    data.forEach((item, i) => {
      if (!item.link && item.children?.length === 1) {
        // hoist nav item if only one child
        data[i] = item.children[0];
      } else if (item.children) {
        // sort nav item children by order or title
        item.children.sort(sidebarDataComparer);
      }
    });
    // sort nav items by order or title
    data.sort(sidebarDataComparer);

    if (mode === 'prepend') data.unshift(...userNavValue);
    else if (mode === 'append') data.push(...userNavValue);

    return data;
  });

  return nav;
};
