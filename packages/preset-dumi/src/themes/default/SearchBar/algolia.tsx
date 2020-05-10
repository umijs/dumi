import React, { FC, useEffect, useContext } from 'react';
import context from '../context';

const AlgoliaSearchBar: FC = () => {
  const { algolia } = useContext(context);

  useEffect(() => {
    (window as any).docsearch({
      apiKey: algolia.apiKey,
      indexName: algolia.indexName,
      inputSelector: '.__dumi-default-search-input',
      debug: algolia.debug,
    });
  }, [algolia]);

  return (
    <div className="__dumi-default-search">
      <input className="__dumi-default-search-input" type="search" />
    </div>
  );
};

export default AlgoliaSearchBar;
