import deepmerge from 'deepmerge';
import {
  getRouteMetaById,
  matchRoutes,
  useAppData,
  useLocation,
  useRouteData,
} from 'dumi';
import { useCallback, useState } from 'react';
import { getRouteMetaHMRRevision, subscribeRouteMetaHMR } from './routeMetaHMR';
import type { IRouteMeta, IRoutesById } from './types';
import { useIsomorphicLayoutEffect } from './utils';

const cache = new Map<string, IRouteMeta>();
const asyncCache = new Map<string, Promise<IRouteMeta>>();
const cacheRevisions = new Map<string, number>();
const EMPTY_META = {
  frontmatter: {},
  toc: [],
  texts: [],
} as any;
const ASYNC_META_PROPS = ['texts'];

export function getCachedRouteMeta(
  route: IRoutesById[string],
  revision: number,
) {
  const cacheKey = route.id;

  if (cacheRevisions.get(cacheKey) !== revision) {
    cache.delete(cacheKey);
    asyncCache.delete(cacheKey);
    cacheRevisions.set(cacheKey, revision);
  }

  if (!cache.get(cacheKey)) {
    const merge = (meta: IRouteMeta = EMPTY_META) => {
      if (route.meta) {
        Object.keys(route.meta).forEach((key) => {
          (meta as any)[key] ??= (route.meta as any)[key];
        });
        meta.frontmatter = deepmerge(
          (revision ? route.meta.frontmatter : meta.frontmatter) ?? {},
          (revision ? meta.frontmatter : route.meta.frontmatter) ?? {},
          {
            arrayMerge: (_destinationArray, sourceArray) => sourceArray,
          },
        );
      }
      return meta;
    };
    const meta = merge(getRouteMetaById(route.id, { syncOnly: true }));
    const proxyGetter = (target: any, prop: string) => {
      if (ASYNC_META_PROPS.includes(prop)) {
        if (!asyncCache.get(cacheKey)) {
          const routeMetaPromise = getRouteMetaById(route.id);
          // load async meta then replace cache
          if (routeMetaPromise) {
            asyncCache.set(
              cacheKey,
              routeMetaPromise.then((full) => {
                if (cacheRevisions.get(cacheKey) !== revision) {
                  return getCachedRouteMeta(
                    route,
                    cacheRevisions.get(cacheKey) ?? 0,
                  );
                }

                return cache.set(cacheKey, merge(full)).get(cacheKey)!;
              }),
            );
          }
        }
        // throw promise to trigger suspense
        const currentCache = asyncCache.get(cacheKey);
        if (currentCache) {
          throw currentCache;
        }
      }

      return target[prop];
    };

    // load async meta if property accessed
    meta.tabs?.forEach((tab) => {
      tab.meta = new Proxy(tab.meta, {
        get: proxyGetter,
      });
    });
    const ret = new Proxy(meta, {
      get: proxyGetter,
    });
    cache.set(cacheKey, ret);
  }

  return cache.get(cacheKey)!;
}

/**
 * hook for get matched route
 * @internal internal use. Do not use in your production code.
 */
export const useMatchedRoute = () => {
  const { route } = useRouteData();
  const { pathname } = useLocation();
  const { clientRoutes } = useAppData();
  const getter = useCallback(() => {
    let ret: IRoutesById[string];

    if (route.path === pathname && !('isLayout' in route)) {
      // use `useRouteData` result if matched, for performance
      ret = route as any;
    } else {
      // match manually for dynamic route & layout component
      const matched = matchRoutes(clientRoutes, pathname)?.pop();
      ret = matched?.route as any;
    }

    return ret;
  }, [clientRoutes.length, pathname]);

  const [matchedRoute, setMatchedRoute] = useState(getter);

  useIsomorphicLayoutEffect(() => {
    setMatchedRoute(getter);
  }, [clientRoutes.length, pathname]);

  return matchedRoute;
};

/**
 * hook for get matched route meta
 */
export const useRouteMeta = () => {
  const route = useMatchedRoute();
  const [, forceUpdate] = useState(0);
  const revision =
    process.env.NODE_ENV === 'production'
      ? 0
      : getRouteMetaHMRRevision(route.id);

  useIsomorphicLayoutEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const unsubscribe = subscribeRouteMetaHMR(route.id, () => {
      forceUpdate((count) => count + 1);
    });

    // Do not miss an update dispatched between render and subscription.
    if (getRouteMetaHMRRevision(route.id) !== revision) {
      forceUpdate((count) => count + 1);
    }

    return unsubscribe;
  }, [route.id, revision]);

  return getCachedRouteMeta(route, revision);
};
