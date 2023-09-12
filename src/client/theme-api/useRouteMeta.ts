import {
  getRouteMetaById,
  matchRoutes,
  useAppData,
  useLocation,
  useRouteData,
} from 'dumi';
import { useCallback, useState } from 'react';
import use from './context/use';
import type { IRouteMeta } from './types';
import { useIsomorphicLayoutEffect } from './utils';

const cache = new Map<string, ReturnType<getRouteMetaById>>();

const useAsyncRouteMeta = (id: string) => {
  if (!cache.has(id)) {
    cache.set(id, getRouteMetaById(id));
  }

  return use<ReturnType<getRouteMetaById>>(cache.get(id));
};

/**
 * hook for get matched route meta
 */
export const useRouteMeta = () => {
  const { route } = useRouteData();
  const { pathname } = useLocation();
  const { clientRoutes } = useAppData();

  const routeMeta = useAsyncRouteMeta(route.id);

  const getter = useCallback((): IRouteMeta => {
    let ret: IRouteMeta;

    if (route.path === pathname && !('isLayout' in route)) {
      // use `useRouteData` result if matched, for performance
      ret = routeMeta;
    } else {
      // match manually for dynamic route & layout component
      const matched = matchRoutes(clientRoutes, pathname)?.pop();

      ret = (matched?.route as any)?.meta;
    }

    return ret || { frontmatter: {}, toc: [], texts: [] };
  }, [clientRoutes.length, pathname]);
  const [meta, setMeta] = useState<IRouteMeta>(getter);

  useIsomorphicLayoutEffect(() => {
    setMeta(getter);
  }, [clientRoutes.length, pathname]);

  return meta;
};
