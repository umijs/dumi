import { IRoute } from '@umijs/types';
import React, { FC, useContext } from 'react';
import context from './context';
import AlgoliaSearchBar from './SearchBar/algolia';
import DefaultSearchBar from './SearchBar/default';
import './SearchBar.less';

interface ISearchBarProps {
  routes: IRoute[];
}

const SearchBar: FC<ISearchBarProps> = (props) => {
  const { algolia } = useContext(context);

return algolia ? <AlgoliaSearchBar /> : <DefaultSearchBar {...props} />
};

export default SearchBar;
