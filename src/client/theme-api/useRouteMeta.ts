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

const cache = new Map<string, any>();

const useAsyncRouteMeta = (id: string) => {
  if (!cache.has(id)) {
    cache.set(id, getRouteMetaById(id));
  }

  return use<any>(cache.get(id)!);
};

const emptyMeta = {
  frontmatter: {},
  toc: [],
  texts: [],
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

  const meta: IRouteMeta =
    useAsyncRouteMeta((curRoute as any)?.id) || emptyMeta;

  if (curRoute && 'meta' in curRoute && typeof curRoute.meta === 'object') {
    Object.keys(curRoute.meta as IRouteMeta).forEach((key) => {
      (meta as any)[key] ??= (curRoute as any).meta[key];
    });
  }

  return meta;
};
