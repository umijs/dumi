import { useLocation, useSiteData } from 'dumi';
import { useState } from 'react';
import type { ILocalesConfig, ISidebarGroup, IThemeConfig } from './types';
import { useLocale, useLocaleDocRoutes } from './utils';

const DEFAULT_GROUP_STUB_TITLE = '$default-group-title';

const getLocaleClearPath = (routePath: string, locale: ILocalesConfig[0]) => {
  return 'base' in locale
    ? routePath.replace(locale.base.slice(1), '').replace(/^\//, '')
    : routePath;
};

/**
 * hook for get sidebar data for all nav
 */
export const useFullSidebarData = () => {
  const locale = useLocale();
  const routes = useLocaleDocRoutes();
  const { themeConfig } = useSiteData();
  const [sidebar] = useState(() => {
    // auto generate sidebar data from routes
    const data = Object.values(routes).reduce<
      Record<string, Record<string, ISidebarGroup>>
    >((ret, route) => {
      const clearPath = getLocaleClearPath(route.path!, locale);

      // skip index routes
      if (clearPath) {
        // extract parent path from route path
        // a => /a
        // en-US/a => /en-US/a
        // a/b => /a
        // en-US/a/b => /en-US/a
        const parentPath = `/${route.path!.replace(/\/[^/]+$/, '')}`;
        const { title, order = 0 } =
          typeof route.meta!.group === 'object'
            ? route.meta!.group
            : { title: route.meta!.group };
        const titleKey = title || DEFAULT_GROUP_STUB_TITLE;

        // create group data by nav path & group name
        ret[parentPath] ??= {};
        ret[parentPath][titleKey] = {
          title,
          order: ret[parentPath][titleKey]?.order || order,
          children: [
            ...(ret[parentPath][titleKey]?.children || []),
            {
              title: route.meta!.title,
              link: `/${route.path}`,
              order: route.meta!.order || 0,
            },
          ],
        };
      }

      return ret;
    }, {});

    // destruct sidebar data into sidebar config
    const sidebarConfig = Object.entries(data).reduce<
      NonNullable<IThemeConfig['sidebar']>
    >((ret, [navPath, groups]) => {
      ret![navPath] = Object.values(groups).sort(
        (a, b) =>
          // sort by group order
          a.order - b.order ||
          (a.title
            ? // sort by group title
              a.title?.localeCompare(b.title || '')
            : // put non-title group at the end
              -1),
      );
      // sort group children by order or title
      ret![navPath].forEach((group) =>
        group.children.sort(
          (a, b) => a.order - b.order || a.title.localeCompare(b.title),
        ),
      );

      return ret;
    }, {});

    // allow user partial override
    return Object.assign(sidebarConfig, themeConfig.sidebar);
  });

  return sidebar;
};

/**
 * hook for get sidebar data for current nav
 */
export const useSidebarData = () => {
  const locale = useLocale();
  const sidebar = useFullSidebarData();
  const { pathname } = useLocation();
  const clearPath = getLocaleClearPath(pathname.slice(1), locale);
  // extract parent path from location pathname
  // /a => /a
  // /a/b => /a
  // /en-US/a => /en-US/a
  // /en-US/a/b => /en-US/a
  const parentPath = clearPath
    ? pathname.replace(/(\/[^/]+)(\/[^/]+)$/, '$1')
    : pathname;

  return parentPath ? sidebar[parentPath] : [];
};
