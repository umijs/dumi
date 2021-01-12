import { useState, useEffect, useContext } from 'react';
// @ts-ignore
import apis from '@@/dumi/apis';
import context from '../context';
import type { IApiDefinition } from '../../api-parser';

/**
 * get API data
 * @param identifier      component name
 * @param locale          current locale
 * @param isDefaultLocale default locale flag
 */
function getApiData(identifier: string, locale: string, isDefaultLocale: boolean) {
  return Object.entries(apis[identifier] as IApiDefinition).reduce<IApiDefinition>(
    (expts, [expt, rows]) => {
      expts[expt] = rows.map(props => {
        // copy original data
        const result = Object.assign({}, props);

        Object.keys(props).forEach(prop => {
          // discard useless locale property
          if (/^description(\.|$)/.test(prop)) {
            const [, propLocale] = prop.match(/^description\.?(.*)$/);

            if ((propLocale && propLocale !== locale) || (!propLocale && !isDefaultLocale)) {
              delete result[prop];
            } else {
              result.description = result[prop];
            }
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
  } = useContext(context);
  const isDefaultLocale = !locales.length || locales[0].name === locale;
  const [data, setData] = useState<IApiDefinition>(getApiData(identifier, locale, isDefaultLocale));

  useEffect(() => {
    setData(getApiData(identifier, locale, isDefaultLocale));
  }, [identifier, locale, isDefaultLocale]);

  return data;
};
