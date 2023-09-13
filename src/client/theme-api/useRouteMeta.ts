import {
  getRouteMetaById,
  matchRoutes,
  useAppData,
  useLocation,
  useRouteData,
} from 'dumi';
import { useMemo } from 'react';
import use from './context/use';
import type { IRouteMeta } from './types';

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

  const curRoute = useMemo(() => {
    if (route.path === pathname && !('isLayout' in route)) {
      // use `useRouteData` result if matched, for performance
      return route;
    } else {
      // match manually for dynamic route & layout component
      const matched = matchRoutes(clientRoutes, pathname)?.pop();
      return matched?.route;
    }
  }, [clientRoutes.length, pathname]);

  const meta: IRouteMeta = useAsyncRouteMeta((curRoute as any)?.id) || {
    frontmatter: {},
    toc: [],
    texts: [],
  };

  if (curRoute && 'meta' in curRoute && (curRoute.meta as any)._atom_route) {
    meta._atom_route = true;
  }

  return meta;
};
