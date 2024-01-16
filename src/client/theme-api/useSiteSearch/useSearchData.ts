import { getFullDemos, getFullRoutesMeta } from 'dumi';
import { useCallback, useRef, useState } from 'react';
import { useLocaleDocRoutes } from '../utils';

type IDemosData = Record<
  string,
  Partial<Awaited<ReturnType<typeof getFullDemos>>[string]>
>;

type ISearchData = [
  routes: ReturnType<typeof useLocaleDocRoutes>,
  demos: IDemosData,
];

export default function useSearchData(): [
  ISearchData | null,
  () => Promise<void>,
] {
  const routes = useLocaleDocRoutes();
  const [data, setData] = useState<ISearchData | null>(null);
  const loading = useRef(false);
  const load = useCallback(async () => {
    if (!loading.current && !data) {
      const routesMeta = await getFullRoutesMeta();
      const demos: IDemosData = await getFullDemos();
      const mergedRoutes: typeof routes = {};

      // generate new routes with meta data
      Object.keys(routes).forEach((routeId) => {
        mergedRoutes[routeId] = {
          ...routes[routeId],
          meta: routesMeta[routeId],
        };
      });

      // omit demo component for postmessage
      Object.entries(demos).forEach(
        ([id, { renderOpts, component, context, ...demo }]) => {
          demos[id] = demo;
        },
      );

      setData([mergedRoutes, demos]);
      loading.current = false;
    }
  }, [data]);

  return [data, load];
}
