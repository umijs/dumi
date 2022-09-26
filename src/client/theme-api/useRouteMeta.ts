import { matchRoutes, useAppData, useLocation, useRouteData } from 'dumi';
import { useCallback, useEffect, useState } from 'react';
import type { IRouteMeta } from './types';

/**
 * hook for get matched route meta
 */
export const useRouteMeta = () => {
  const { route } = useRouteData();
  const { pathname } = useLocation();
  const { clientRoutes } = useAppData();
  const getter = useCallback((): IRouteMeta => {
    let ret: IRouteMeta;

    if (route.path === pathname && !('isLayout' in route)) {
      // use `useRouteData` result if matched, for performance
      ret = (route as any).meta;
    } else {
      // match manually for dynamic route & layout component
      const matched = matchRoutes(clientRoutes, pathname)?.pop();

      ret = (matched?.route as any)?.meta;
    }

    return ret || {};
  }, [clientRoutes.length, pathname]);
  const [meta, setMeta] = useState<IRouteMeta>(getter);

  useEffect(() => {
    setMeta(getter);
  }, [clientRoutes.length, pathname]);

  return meta;
};
