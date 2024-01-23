import { PluginManager, useAppData, useIntl, useSiteData } from 'dumi';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import type {
  ILocale,
  INav,
  INavItem,
  IRouteMeta,
  IRoutesById,
  IUserNavValue,
} from './types';
import { useLocale } from './useLocale';

/**
 * private instance, do not use it in your code
 */
export let pluginManager: PluginManager;

export const setPluginManager = (pm: PluginManager) => {
  pluginManager = pm;
};

export const useLocaleDocRoutes = () => {
  const intl = useIntl();
  const { routes } = useAppData();
  const { locales } = useSiteData();
  const [localeDocRoutes] = useState(() => {
    const reversedLocales = locales.slice().reverse();

    return Object.values(routes).reduce<IRoutesById>((ret, route) => {
      const matched = reversedLocales.find((locale) =>
        'suffix' in locale
          ? // suffix mode
            route.path!.endsWith(locale.suffix)
          : // base mode
            route.path!.startsWith(locale.base.slice(1)),
      )!;

      if (route.parentId === 'DocLayout' && matched.id === intl.locale) {
        ret[route.id] = route;
      }

      return ret;
    }, {});
  });

  return localeDocRoutes;
};

/**
 * 在 react 18 中需要新的 render 方式，这个函数用来处理不同的 jsx 模式。
 * @param version react version
 * @returns code string
 */
export const genReactRenderCode = (version: string): string => {
  const annotation = `/**
 * This is an auto-generated demo by dumi
 * if you think it is not working as expected,
 * please report the issue at
 * https://github.com/umijs/dumi/issues
 */`;

  if (version.startsWith('18.') || version === 'latest') {
    return `${annotation}

import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);`;
  }
  return `${annotation}

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);`;
};

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * common comparer for sidebar/nav items
 */
export const useRouteDataComparer = <
  T extends { order?: number; link?: string; path?: string; title?: string },
>() => {
  const locale = useLocale();

  return useCallback((a: T, b: T) => {
    return (
      // smaller before larger for all
      ('order' in a && 'order' in b ? a.order! - b.order! : 0) ||
      // shallower before deeper for sidebar item
      ('link' in a && 'link' in b
        ? a.link!.split('/').length - b.link!.split('/').length
        : 0) ||
      // shallower before deeper for sidebar leaf
      ('path' in a && 'path' in b
        ? a.path!.split('/').length - b.path!.split('/').length
        : 0) ||
      // fallback to compare title (put non-title item at the end)
      (a.title ? a.title.localeCompare(b.title || '', locale.id) : -1)
    );
  }, []);
};

/**
 * common util for pick meta to sort sidebar/nav items
 */
export const pickRouteSortMeta = (
  original: Partial<Pick<INavItem, 'order' | 'title'>>,
  field: 'nav' | 'nav.second' | 'group',
  fm: IRouteMeta['frontmatter'],
) => {
  const sub: IRouteMeta['frontmatter']['group'] =
    field === 'nav.second'
      ? typeof fm.nav === 'object'
        ? fm.nav.second
        : {}
      : fm[field];

  switch (typeof sub) {
    case 'object':
      original.title = sub.title || original.title;
      original.order = sub.order ?? original.order;
      break;

    case 'string':
      original.title = sub || original.title;
      break;

    default:
  }

  return original;
};

export function getLocaleNav(nav: IUserNavValue | INav, locale: ILocale) {
  return Array.isArray(nav) ? nav : nav[locale.id];
}
