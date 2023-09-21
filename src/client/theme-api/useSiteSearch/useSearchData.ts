import { loadFilesMeta, useSiteData } from 'dumi';
import React from 'react';
import type { DemoInfo } from '../context';
import type { IRouteMeta } from '../types';
import { useLocaleDocRoutes } from '../utils';

type RoutesData = Record<string, IRouteMeta & { demos: DemoInfo[] }>;

type Demos = Record<string, DemoInfo>;

type ReturnData = [
  routes: ReturnType<typeof useLocaleDocRoutes> | null,
  demo: Demos | null,
];

export default function useSearchData(enabled: boolean): ReturnData {
  const routes = useLocaleDocRoutes();
  const [filesMeta, setFilesMeta] = React.useState<RoutesData | null>(null);
  const { tabs } = useSiteData();

  React.useEffect(() => {
    if (enabled) {
      loadFilesMeta(Object.keys(routes)).then((data) => {
        setFilesMeta(data);
      });
    }
  }, [enabled, routes]);

  return React.useMemo(() => {
    if (!filesMeta) {
      return [null, null];
    }

    // Route Meta
    const mergedRoutes: typeof routes = {};

    Object.keys(routes).forEach((routeId) => {
      mergedRoutes[routeId] = {
        ...routes[routeId],
      };

      // Fill routes meta
      if (mergedRoutes[routeId].meta) {
        mergedRoutes[routeId].meta = {
          ...mergedRoutes[routeId].meta,
          ...filesMeta[routeId],
          tabs: mergedRoutes[routeId].tabs?.map((id: string) => {
            const meta = {
              frontmatter: { title: tabs[id].title },
              toc: [],
              texts: [],
            };
            return {
              ...tabs[id],
              meta: filesMeta[id] || meta,
            };
          }),
        };
      }
    });

    // Demos
    const demos: Demos = Object.entries(filesMeta).reduce((acc, [id, meta]) => {
      // append route id to demo
      if (meta.demos) {
        Object.values(meta.demos).forEach((demo) => {
          demo.routeId = id;
        });
        Object.assign(acc, meta.demos);
      }
      // merge demos

      return acc;
    }, {});

    return [mergedRoutes, demos];
  }, [filesMeta, routes, tabs]);
}
