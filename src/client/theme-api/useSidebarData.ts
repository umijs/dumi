import { useLocale, useLocation, useRouteMeta, useSiteData } from 'dumi';
import { useState } from 'react';
import type {
  ILocalesConfig,
  IRouteMeta,
  ISidebarGroup,
  ISidebarItem,
  IThemeConfig,
} from './types';
import {
  pickRouteSortMeta,
  useLocaleDocRoutes,
  useRouteDataComparer,
} from './utils';

const DEFAULT_GROUP_STUB_TITLE = '$default-group-title';

export const getLocaleClearPath = (
  routePath: string,
  locale: ILocalesConfig[0],
) => {
  return 'base' in locale
    ? routePath.replace(locale.base.slice(1), '').replace(/^\//, '')
    : routePath;
};

/**
 * get parent path from route path
 */
export function getRouteParentPath(
  path: string,
  {
    meta,
    is2LevelNav,
    locale,
  }: { meta?: IRouteMeta; is2LevelNav: boolean; locale: ILocalesConfig[0] },
) {
  const indexDocRegex = new RegExp(`/index(\\.${locale.id})?.md$`);
  const isIndexDocRoute =
    meta?.frontmatter.filename &&
    indexDocRegex.test(meta.frontmatter.filename) &&
    !meta._atom_route &&
    is2LevelNav;
  const paths = path
    .split('/')
    // strip end slash
    .filter(Boolean);
  const sliceEnd = Math.min(
    Math.max(
      // increase 1 level if route file is index.md
      isIndexDocRoute ? paths.length : paths.length - 1,
      // least 1-level
      1,
    ),
    // up to 2-level when use conventional 2-level nav
    is2LevelNav ? 2 : Infinity,
  );

  return paths.slice(0, sliceEnd).join('/');
}

/**
 * hook for get sidebar data for all nav
 */
export const useFullSidebarData = () => {
  const locale = useLocale();
  const routes = useLocaleDocRoutes();
  const { themeConfig, _2_level_nav_available: is2LevelNav } = useSiteData();
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
        // normal examples:
        //   a => /a
        //   en-US/a => /en-US/a
        //   a/b => /a
        //   en-US/a/b => /en-US/a
        // convention 2-level navs examples:
        //   a/b => /a/b (if route file is a/b/index.md)
        //   a/b/c => /a/b
        const parentPath = `/${route.path!.replace(clearPath, (s) =>
          getRouteParentPath(s, { is2LevelNav, meta: route.meta!, locale }),
        )}`;
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
  const { _2_level_nav_available: is2LevelNav } = useSiteData();
  const { pathname } = useLocation();
  const meta = useRouteMeta();
  const clearPath = getLocaleClearPath(pathname.slice(1), locale);
  // extract parent path from location pathname
  // /a => /a
  // /a/b => /a
  // /en-US/a => /en-US/a
  // /en-US/a/b => /en-US/a
  // /en-US/a/b/ => /en-US/a (also strip trailing /)
  const parentPath = clearPath
    ? pathname.replace(clearPath, (s) =>
        getRouteParentPath(s, { is2LevelNav, meta, locale }),
      )
    : pathname;

  return parentPath ? sidebar[parentPath] : [];
};
