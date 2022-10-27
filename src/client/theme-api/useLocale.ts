import { useIntl, useSiteData } from 'dumi';
import { useState } from 'react';
import type { ILocale } from './types';

export const useLocale = (): ILocale => {
  const intl = useIntl();
  const { locales } = useSiteData();
  const [locale] = useState(
    () => locales.find(({ id }) => id === intl.locale)!,
  );
  return locale;
};
