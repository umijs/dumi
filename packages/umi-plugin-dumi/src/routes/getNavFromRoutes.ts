import { IRoute } from '@umijs/types';
import { IDumiOpts } from '..';

export interface INavItem {
  title: string;
  path: string;
  [key: string]: any;
}

export interface INav {
  [key: string]: INavItem[];
}

export default (routes: IRoute[], opts: IDumiOpts): INav => {
  let localeNavs = {};

  if (opts.mode !== 'site') {
    return {};
  }

  // group navs by locale
  routes.forEach(route => {
    if (route.meta?.nav) {
      const locale = route.meta.locale || opts.locales[0]?.[0] || '*';

      localeNavs[locale] = {
        ...(localeNavs[locale] || {}),
        [route.meta.nav.path]: {
          ...(localeNavs[locale]?.[route.meta.nav.path] || {}),
          ...(route.meta.nav || {}),
        },
      };
    }
  });

  // deconstruct locale navs from mapping to array
  Object.keys(localeNavs).forEach(key => {
    localeNavs[key] = Object.values(localeNavs[key]).sort((prev: INavItem, next: INavItem) => {
      const prevOrder = typeof prev.order === 'number' ? prev.order : 0;
      const nextOrder = typeof next.order === 'number' ? next.order : 0;
      // compare order meta config first
      const metaOrder = prevOrder === nextOrder ? 0 : nextOrder - prevOrder;
      // last compare path length
      const pathOrder = prev.path.length - next.path.length;
      // then compare title ASCII
      const ascOrder = prev.title > next.title ? 1 : prev.title < next.title ? -1 : 0;

      return metaOrder || pathOrder || ascOrder;
    });
  });

  // replace unique locale key with *
  Object.keys(localeNavs).some((locale, _, locales) => {
    if (locales.length === 1) {
      localeNavs = {
        '*': localeNavs[locale],
      };
    }

    return true;
  });

  return localeNavs;
};
