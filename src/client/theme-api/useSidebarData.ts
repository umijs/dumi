import { useLocale, useLocation, useSiteData } from 'dumi';
import { useState } from 'react';
import type {
  ILocalesConfig,
  ISidebarGroup,
  ISidebarItem,
  IThemeConfig,
} from './types';
import {
  pickRouteSortMeta,
  useLocaleDocRoutes,
  useRouteDataComparer,
  concat,
} from './utils';

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
  const sidebarDataComparer = useRouteDataComparer<
    ISidebarGroup | ISidebarItem
  >();
  const [sidebar] = useState<NonNullable<IThemeConfig['sidebar']>>(() => {
    // auto generate sidebar data from routes
    const data = Object.values(routes).reduce<
      Record<string, Record<string, ISidebarGroup>>
    >((ret, route) => {
      const clearPath = getLocaleClearPath(route.path!, locale);

      // skip index routes
      if (clearPath && route.meta) {
        // extract parent path from route path
        // a => /a
        // en-US/a => /en-US/a
        // a/b => /a
        // en-US/a/b => /en-US/a
        const parentPath = `/${route.path!.replace(/\/[^/]+$/, '')}`;
        const { title, order } = pickRouteSortMeta(
          { order: 0 },
          'group',
          route.meta.frontmatter,
        );
        const titleKey = title || DEFAULT_GROUP_STUB_TITLE;

        // create group data by nav path & group name
        ret[parentPath] ??= {};
        ret[parentPath][titleKey] = {
          title,
          order: ret[parentPath][titleKey]?.order || order,
          children: [
            ...(ret[parentPath][titleKey]?.children || []),
            {
              title: route.meta.frontmatter.title,
              link: `/${route.path}`,
              order: route.meta.frontmatter.order || 0,
              frontmatter: route.meta.frontmatter,
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
      ret![navPath] = Object.values(groups).sort(sidebarDataComparer);
      // sort group children by order or title
      ret![navPath].forEach((group) =>
        group.children.sort(sidebarDataComparer),
      );

      return ret;
    }, {});

    Object.keys(themeConfig.sidebar ?? {}).forEach(key => {
      const group = themeConfig.sidebar?.[key]
      group?.forEach(item => {
        item.children = item.children?.map(child => {
          // 如果 ISidebarItem 输入为string 就去sidebarConfig寻找相同link的配置
          if (typeof child === 'string') {
            const groups = concat(...Object.values(sidebarConfig))
            const items = concat(...groups.map(group => group.children))
            const isExist = items.find(item => item.link.toUpperCase() === (child as unknown as string).toUpperCase())
            if (isExist) {
              return {
                ...isExist,
                ...isExist.frontmatter,
                frontmatter: isExist.frontmatter,
              }
            }
          }
          return child;
        })
      })
    })

    // allow user partial override
    return Object.assign(sidebarConfig, themeConfig.sidebar);
  });

  return sidebar;
};

interface ITreeSidebarLeaf {
  path: string;
  title: string;
  order: number;
  children: (ITreeSidebarLeaf | ISidebarGroup)[];
}

function getLeafMeta(data: (ISidebarGroup | ITreeSidebarLeaf)[]) {
  const leafMeta = { order: 0, title: '' };

  for (let group of data) {
    for (let item of group.children) {
      if ('frontmatter' in item) {
        pickRouteSortMeta(leafMeta, 'nav', item.frontmatter);
      }
    }
  }

  return leafMeta;
}

/**
 * hook for get full sidebar data in tree structure
 */
export const useTreeSidebarData = () => {
  const original = useFullSidebarData();
  const sidebarDataComparer = useRouteDataComparer<
    ITreeSidebarLeaf | ISidebarGroup
  >();
  const [sidebar] = useState(() => {
    const data = Object.entries(original)
      // match from the deepest level
      .sort((a, b) => b[0].split('/').length - a[0].split('/').length)
      .reduce<Record<string, ITreeSidebarLeaf>>((ret, [path, data]) => {
        const parent = path.replace(/\/[^/]+$/, '');

        if (parent) {
          // handle nested sidebar data
          // init parent first
          ret[parent] ??= {
            path: parent,
            children: original[parent] || [],
            ...getLeafMeta(original[parent] || []),
          };

          if (ret[path]) {
            // sort children first
            ret[path].children.sort(sidebarDataComparer);
            // put n-level sidebar data as parent children
            ret[parent].children.push(ret[path]);
            delete ret[path];
          } else {
            // put last-level sidebar data as parent children
            ret[parent].children.push(...data);
          }
        } else {
          // sort children first
          data.sort(sidebarDataComparer);
          // put top-level sidebar data
          ret[path] = {
            path,
            children: data,
            ...getLeafMeta(data),
          };
        }

        return ret;
      }, {});

    return Object.values(data);
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
  // /en-US/a/b/ => /en-US/a (also strip trailing /)
  const parentPath = clearPath
    ? pathname.replace(/(\/[^/]+)(\/[^/]+\/?)$/, '$1')
    : pathname;

  return parentPath ? sidebar[parentPath] : [];
};
