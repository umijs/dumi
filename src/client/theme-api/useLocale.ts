import { useIntl, useSiteData } from 'dumi';
import { useState } from 'react';

export const useLocale = () => {
  const intl = useIntl();
  const { locales } = useSiteData();
  const [locale] = useState(
    () => locales.find(({ id }) => id === intl.locale)!,
  );

  return locale;
};
