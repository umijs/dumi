import { useState, useEffect, useContext } from 'react';
import context from '../context';
import type { IThemeContext } from '../context';

/**
 * get API data
 * @param identifier      component name
 * @param locale          current locale
 * @param isDefaultLocale default locale flag
 */
function getApiData(
  apis: IThemeContext['apis'],
  identifier: string,
  locale: string,
  isDefaultLocale: boolean,
) {
  return Object.entries(apis[identifier]).reduce<IThemeContext['apis']['0']>(
    (expts, [expt, rows]) => {
      expts[expt] = rows.map(props => {
        // default description cover miss locale
        const result = { description: props.description } as typeof props;

        Object.keys(props).forEach(prop => {
          // get locale description data
          if (/^description(\.|$)/.test(prop)) {
            const [, propLocale] = prop.match(/^description\.?(.*)$/);
            if ((isDefaultLocale && !propLocale) || (propLocale && propLocale === locale)) {
              result.description = props[prop]
            }
          } else {
            // copy original property
            result[prop] = props[prop]
          }
        });

        return result;
      });

      return expts;
    },
    {},
  );
}

/**
 * use api data by identifier
 * @note  identifier is component name or component path
 */
export default (identifier: string) => {
  const {
    locale,
    config: { locales },
    apis,
  } = useContext(context);
  const isDefaultLocale = !locales.length || locales[0].name === locale;
  const [data, setData] = useState(getApiData(apis, identifier, locale, isDefaultLocale));

  useEffect(() => {
    setData(getApiData(apis, identifier, locale, isDefaultLocale));
  }, [apis, identifier, locale, isDefaultLocale]);

  return data;
};
