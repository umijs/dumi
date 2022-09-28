import { useAppData, useIntl, useSiteData } from 'dumi';
import { useState } from 'react';
import type { IRoutesById } from './types';

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
