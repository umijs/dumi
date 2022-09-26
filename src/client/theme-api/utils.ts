import { useAppData } from 'dumi';
import { Context, useIntl } from 'dumi/theme';
import { useContext, useState } from 'react';
import type { IRoutesById } from './types';

export const useLocale = () => {
  const intl = useIntl();
  const { locales } = useContext(Context);
  const [locale] = useState(
    () => locales.find(({ id }) => id === intl.locale)!,
  );

  return locale;
};

export const useLocaleDocRoutes = () => {
  const intl = useIntl();
  const { routes } = useAppData();
  const { locales } = useContext(Context);
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
