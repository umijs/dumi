import { useNavData, useSiteData } from 'dumi';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocaleDocRoutes } from '../utils';
// @ts-ignore
import workerCode from '-!../../../../compiled/_internal/searchWorker.min?dumi-raw';

export interface IHighlightText {
  highlighted?: boolean;
  text: string;
}

export interface ISearchNavResult {
  title?: string;
  priority: number;
  hints: {
    type: 'page' | 'title' | 'demo' | 'content';
    link: string;
    priority: number;
    pageTitle: string;
    highlightTitleTexts: IHighlightText[];
    highlightTexts: IHighlightText[];
  }[];
}

export type ISearchResult = ISearchNavResult[];

let worker: Worker;

// for ssr
if (typeof window !== 'undefined') {
  // use blob to avoid generate entry(chunk) for worker
  worker = new Worker(
    URL.createObjectURL(
      new Blob([workerCode], { type: 'application/javascript' }),
    ),
  );
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
