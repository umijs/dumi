import { IRoute } from '@umijs/types';
import { Link } from 'umi';
import React, { FC, useState, useEffect, useContext } from 'react';
import { scrollToSlug } from './SlugList';
import context from './context';
import './SearchBar.less';

interface ISearchBarProps {
  routes: IRoute[];
}

interface SearchMetaItem {
  title: string;
  path: string;
  parent?: SearchMetaItem;
}

const SearchBar: FC<ISearchBarProps> = ({ routes }) => {
  const { locale, locales } = useContext(context);
  const [metas, setMetas] = useState<SearchMetaItem[]>([]);
  const [items, setItems] = useState<SearchMetaItem[]>([]);
  const [keywords, setKeywords] = useState<string>('');

  useEffect(() => {
    setMetas(
      routes
        .filter(({ title, meta }) => {
          const isValidDefaultLocaleRoute =
            locale === '*' && (!meta?.locale || meta?.locale === locales[0].name);
          const isValidLocaleRoute = meta?.locale === locale;

          return title && (isValidDefaultLocaleRoute || isValidLocaleRoute);
        })
        .reduce((result, route) => {
          const routeMetaItem: SearchMetaItem = {
            title: route.title,
            path: route.path,
          };

          if (route.meta?.group) {
            routeMetaItem.parent = route.meta.group;
          }

          result.push(routeMetaItem);
          result.push(
            ...(route.meta?.slugs || []).map(slug => ({
              title: slug.value,
              path: `${route.path}#${slug.heading}`,
              parent: routeMetaItem,
            })),
          );

          return result;
        }, [] as SearchMetaItem[]),
    );
  }, [routes.length]);

  useEffect(() => {
    const val = keywords.trim();

    if (val) {
      const result = [];

      // at least find 5 results
      for (let i = 0; i < metas.length && result.length < 6; i += 1) {
        if (metas[i].title.indexOf(keywords) > -1) {
          result.push(metas[i]);
        }
      }

      setItems(result);
    } else {
      setItems([]);
    }
  }, [keywords]);

  return (
    <div className="__dumi-default-search">
      <input type="search" value={keywords} onChange={ev => setKeywords(ev.target.value)} />
      <ul>
        {items.map(meta => (
          <li
            key={meta.path}
            onClick={() => {
              const slug = meta.path.split('#')[1];

              if (slug) {
                scrollToSlug(slug);
              }

              setKeywords('');
            }}
          >
            <Link to={meta.path}>
              {meta.parent?.title && <span>{meta.parent.title}</span>}
              {meta.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchBar;
