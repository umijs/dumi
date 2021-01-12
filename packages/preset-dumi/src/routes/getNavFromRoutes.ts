import type { IRoute } from '@umijs/types';
import { addHtmlSuffix } from './getMenuFromRoutes';
import type { IDumiOpts } from '..';

export interface INavItem {
  title: string;
  path?: string;
  [key: string]: any;
  children: INavItem[];
}

export type INav = Record<string, INavItem[]>;

export default (routes: IRoute[], opts: IDumiOpts, userCustomNavs: INav | INavItem[]): INav => {
  const localeNavs = {};
  let customNavs = userCustomNavs || {};

  if (opts.mode !== 'site') {
    return {};
  }

  // group navs by locale
  routes.forEach(route => {
    if (route.meta?.nav) {
      const locale = route.meta.locale || opts.locales[0][0];
      const navPath = addHtmlSuffix(route.meta.nav.path);

      localeNavs[locale] = {
        ...(localeNavs[locale] || {}),
        [navPath]: {
          ...(localeNavs[locale]?.[navPath] || {}),
          ...(route.meta.nav || {}),
          path: navPath,
        },
      };
    }
  });

  // deconstruct locale navs from mapping to array
  Object.keys(localeNavs).forEach(key => {
    localeNavs[key] = Object.values(localeNavs[key]).sort((prev: INavItem, next: INavItem) => {
      const prevOrder = typeof prev.order === 'number' ? prev.order : Infinity;
      const nextOrder = typeof next.order === 'number' ? next.order : Infinity;
      // compare order meta config first
      const metaOrder = prevOrder === nextOrder ? 0 : prevOrder - nextOrder;
      // last compare path length
      const pathOrder = prev.path.length - next.path.length;
      // then compare title ASCII
      // eslint-disable-next-line
      const ascOrder = prev.title > next.title ? 1 : prev.title < next.title ? -1 : 0;

      return metaOrder || pathOrder || ascOrder;
    });
  });

  // merge user's navs & generated navs
  if (Array.isArray(customNavs)) {
    customNavs = Object.keys(localeNavs).reduce((result, locale) => {
      result[locale] = customNavs;

      return result;
    }, {});
  }

  Object.keys(localeNavs).forEach(locale => {
    if (customNavs[locale]) {
      localeNavs[locale] = customNavs[locale].reduce(
        // concat original navs if navs has empty item from user
        (result, nav) => result.concat(nav || localeNavs[locale]),
        [],
      );
    }
  });

  return localeNavs;
};
