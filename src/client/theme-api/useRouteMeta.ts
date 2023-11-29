import {
  getRouteMetaById,
  matchRoutes,
  useAppData,
  useLocation,
  useRouteData,
} from 'dumi';
import { useCallback, useState } from 'react';
import type { IRouteMeta, IRoutesById } from './types';
import { use, useIsomorphicLayoutEffect } from './utils';

const cache = new Map<string, Promise<IRouteMeta | undefined>>();
const EMPTY_META = {
  frontmatter: {},
  toc: [],
  texts: [],
} as any;
const ASYNC_META_PROPS = ['texts'];

function getCachedRouteMeta(route: IRoutesById[string]) {
  const cacheKey = route.id;

  if (!cache.get(cacheKey)) {
    const merge = (meta: IRouteMeta = EMPTY_META) => {
      if (route.meta) {
        Object.keys(route.meta).forEach((key) => {
          (meta as any)[key] ??= (route.meta as any)[key];
        });
      }

      return meta;
    };
    const meta = merge(getRouteMetaById(route.id, { syncOnly: true }));
    const ret: Parameters<typeof use<IRouteMeta>>[0] & {
      _async_loading?: boolean;
    } = Promise.resolve(meta);

    // return sync meta by default
    ret.status = 'fulfilled';
    ret._async_loading = false;

    // load async meta if property accessed
    ret.value = new Proxy<IRouteMeta>(meta, {
      get(target, prop: keyof IRouteMeta) {
        if (ASYNC_META_PROPS.includes(prop) && !ret._async_loading) {
          ret._async_loading = true;

          // replace with async meta
          cache.set(cacheKey, getRouteMetaById(route.id).then(merge));

          // throw promise to trigger suspense
          throw cache.get(cacheKey);
        }

        return target[prop];
      },
    });

    cache.set(cacheKey, ret);
  }

  return cache.get(cacheKey)!;
}

/**
 * hook for get matched route meta
 */
export const useRouteMeta = () => {
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
  const meta = use(getCachedRouteMeta(matchedRoute));

  useIsomorphicLayoutEffect(() => {
    setMatchedRoute(getter);
  }, [clientRoutes.length, pathname]);

  return meta!;
};
