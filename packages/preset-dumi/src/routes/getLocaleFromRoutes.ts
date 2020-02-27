import { IRoute } from '@umijs/types';
import { IDumiOpts } from '..';

export interface ILocale {
  name: string;
  label: string;
}

export default (routes: IRoute[], opts: IDumiOpts): ILocale[] => {
  const validLocales = new Set<string>();
  const locales: ILocale[] = [];

  // collect valid locales set
  routes.forEach(route => {
    const localeName = route.meta?.locale || opts.locales[0]?.[0];
    const locale = opts.locales.find(([name]) => name === localeName);

    if (locale) {
      validLocales.add(locale[0]);
    }
  });

  // filter valid locales from locale options
  locales.push(
    ...opts.locales
      .filter(([name]) => validLocales.has(name))
      .map(([name, label]) => ({ name, label })),
  );

  // discard unique locale
  if (locales.length === 1) {
    locales.splice(0, 1);
  }

  return locales;
};
