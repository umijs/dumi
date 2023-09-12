import { history, useLocation, useRouteMeta, useSearchParams } from 'dumi';
import { useCallback } from 'react';
import type { IRouteMeta } from './types';

export const TAB_QUERY_KEY = 'tab';

export const useTabQueryState = (): [string | null, (val?: string) => void] => {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const setTabQueryState = useCallback(
    (val?: string) => {
      if (val) params.set(TAB_QUERY_KEY, val);
      else params.delete(TAB_QUERY_KEY);

      history.push({
        pathname,
        search: `?${params.toString()}`,
      });
    },
    [params],
  );

  return [params.get(TAB_QUERY_KEY), setTabQueryState];
};

export const useTabMeta = ():
  | NonNullable<IRouteMeta['tabs']>[0]['meta']
  | undefined => {
  const { tabs } = useRouteMeta();
  const [tabKey] = useTabQueryState();

  return tabs?.find(({ key }) => tabKey === key)?.meta;
};
