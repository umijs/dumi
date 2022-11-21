import { useNavData, useSiteData } from 'dumi';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocaleDocRoutes } from '../utils';
import type { ISearchResult } from './worker';

let worker: Worker;

// for ssr
if (typeof window !== 'undefined') {
  worker = new Worker(new URL('./worker', import.meta.url));
}

export const useSiteSearch = () => {
  const debounceTimer = useRef<number>();
  const routes = useLocaleDocRoutes();
  const { demos } = useSiteData();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const navData = useNavData();
  const [result, setResult] = useState<ISearchResult>([]);
  const setter = useCallback((val: string) => {
    setLoading(true);
    setKeywords(val);
  }, []);

  useEffect(() => {
    worker.onmessage = (e) => {
      setResult(e.data);
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    // omit demo component for postmessage
    const demoData = Object.entries(demos).reduce<
      Record<string, Partial<typeof demos[0]>>
    >(
      (acc, [key, { asset, routeId }]) => ({
        ...acc,
        [key]: { asset, routeId },
      }),
      {},
    );

    worker.postMessage({
      action: 'generate-metadata',
      args: {
        routes: JSON.parse(JSON.stringify(routes)),
        nav: navData,
        demos: demoData,
      },
    });
  }, [routes, demos, navData]);

  useEffect(() => {
    const str = keywords.trim();

    if (str) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = window.setTimeout(() => {
        worker.postMessage({
          action: 'get-search-result',
          args: {
            keywords: str,
          },
        });
      }, 200);
    } else {
      setResult([]);
    }
  }, [keywords]);

  return { keywords, setKeywords: setter, result, loading };
};
