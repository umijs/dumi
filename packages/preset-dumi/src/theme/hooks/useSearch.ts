import { useContext, useEffect, useState, useCallback } from 'react';
import { context } from '..';

interface ISearchMetaItem {
  title: string;
  path: string;
  parent?: ISearchMetaItem;
}

/**
 * hooks for get search result by keywords (builtin search feature)
 * @param keywords  search keywords
 */
const useBuiltinSearch = (keywords: string) => {
  const {
    locale,
    routes,
    config: { locales },
  } = useContext(context);
  const [metas, setMetas] = useState<ISearchMetaItem[]>([]);
  const [items, setItems] = useState<ISearchMetaItem[]>([]);

  useEffect(() => {
    setMetas(
      routes
        .filter(({ title, meta }) => {
          const isValidLocaleRoute = meta?.locale === locale;
          const isValidDefaultLocaleRoute =
            // route locale euqal default locale
            meta?.locale === locales[0].name ||
            // missing locale and there has no locale or global locale equal default locale
            (!meta?.locale && (!locales.length || locale === locales[0].name));

          return title && (isValidDefaultLocaleRoute || isValidLocaleRoute);
        })
        .reduce((result, route) => {
          const routeMetaItem: ISearchMetaItem = {
            title: route.title,
            path: route.path,
          };

          if (route.meta?.group) {
            routeMetaItem.parent = route.meta.group;
          }

          result.push(routeMetaItem);
          result.push(
            ...(route.meta?.slugs || [])
              .filter(({ value }) => value !== route.title)
              .map(slug => ({
                title: slug.value,
                path: `${route.path}#${slug.heading}`,
                parent: routeMetaItem,
              })),
          );

          return result;
        }, [] as ISearchMetaItem[]),
    );
  }, [routes.length, locale]);

  useEffect(() => {
    const val = keywords?.trim().toUpperCase();

    if (val) {
      const result = [];

      for (let i = 0; i < metas.length; i += 1) {
        if (metas[i].title.toUpperCase().indexOf(val) > -1) {
          result.push(metas[i]);
        }
      }

      setItems(result);
    } else {
      setItems([]);
    }
  }, [keywords, metas.length]);

  return items;
};

/**
 * hooks for bind Algolia search feature
 */
const useAlgoliaSearch = () => {
  const {
    config: { algolia },
  } = useContext(context);
  const binder = useCallback(
    (selector: string) => {
      (window as any).docsearch({
        inputSelector: selector,
        ...algolia,
      });
    },
    [algolia],
  );

  return binder;
};

/**
 * use to bind algolia or return search result by keywords
 */
export default (keywords?: string) => {
  const { config } = useContext(context);
  const builtin = useBuiltinSearch(keywords);
  const algolia = useAlgoliaSearch();

  return config.algolia ? algolia : builtin;
};
