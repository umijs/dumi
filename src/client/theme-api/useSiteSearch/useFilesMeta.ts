import { loadFilesMeta } from 'dumi';
import React from 'react';
import type { IRouteMeta } from '../types';

type RoutesData = Record<string, IRouteMeta>;

export default function useSearchData(enabled: boolean) {
  const [searchData, setSearchData] = React.useState<RoutesData | null>(null);

  React.useEffect(() => {
    if (enabled) {
      loadFilesMeta().then((data) => {
        setSearchData(data);
      });
    }
  }, [enabled]);

  return searchData;
}
