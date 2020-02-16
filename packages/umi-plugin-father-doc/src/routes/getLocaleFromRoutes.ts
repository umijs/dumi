import { IRoute } from 'umi-types';
import { IFatherDocOpts } from '..';

export interface ILocale {
  name: string;
  label: string;
}

export default (routes: IRoute[], opts: IFatherDocOpts): ILocale[] => {
  const localesMapping: { [key: string]: ILocale } = {};
  const locales: ILocale[] = [];

  // collect locales mapping
  routes.forEach(route => {
    const localeName = route.meta?.locale || opts.locales[0]?.[0];
    const locale = opts.locales.find(([name]) => name === localeName);

    if (locale && !localesMapping[locale[0]]) {
      localesMapping[locale[0]] = { name: locale[0], label: locale[1] };
    }
  });

  // deconstruct locale from mapping to array
  locales.push(...Object.values(localesMapping));

  // discard unique locale
  if (locales.length === 1) {
    locales.splice(0, 1);
  }

  return locales;
};
