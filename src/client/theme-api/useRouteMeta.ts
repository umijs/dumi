import { matchRoutes, useAppData, useLocation, useRouteData } from 'dumi';
import { useCallback, useMemo, useState } from 'react';
import type { IRouteMeta } from './types';
import { useIsomorphicLayoutEffect } from './utils';

export type RouteMatch = NonNullable<ReturnType<typeof matchRoutes>>[number];
export type RouteObject = RouteMatch['route'];

const useRouteInfo = () => {
  const { route } = useRouteData();
  const { pathname } = useLocation();
  const { clientRoutes } = useAppData();
  const getter = useCallback(() => {
    let ret: RouteObject | undefined;

    if (route.path === pathname && !('isLayout' in route)) {
      // use `useRouteData` result if matched, for performance
      ret = (route as any).meta;
    } else {
      // match manually for dynamic route & layout component
      const matched = matchRoutes(clientRoutes, pathname)?.pop();

      ret = matched?.route;
    }

    return ret;
  }, [clientRoutes.length, pathname]);
  const [meta, setMeta] = useState<RouteObject | undefined>(getter);

  useIsomorphicLayoutEffect(() => {
    setMeta(getter);
  }, [clientRoutes.length, pathname]);

  return meta;
};

/**
 * hook for get matched route meta
 */
export const useRouteMeta = (): IRouteMeta => {
  const routeInfo = useRouteInfo();

  return useMemo(
    () => ({
      id: (routeInfo as any)?.id,
      frontmatter: {},
      toc: [],
      texts: [],
      ...(routeInfo as any)?.meta,
    }),
    [routeInfo],
  );
};
