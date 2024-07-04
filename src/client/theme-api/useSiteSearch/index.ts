import { useNavData } from 'dumi';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSearchData from './useSearchData';

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
      // @ts-ignore
      new Blob([SEARCH_WORKER_CODE], { type: 'application/javascript' }),
    ),
  );
}

export const useSiteSearch = () => {
  const debounceTimer = useRef<number>();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const navData = useNavData();
  const [result, setResult] = useState<ISearchResult>([]);
  const [data, load] = useSearchData();
  const setter = useCallback((val: string) => {
    load();
    setLoading(true);
    setKeywords(val);
  }, []);
  const routes = data?.[0];
  const demos = data?.[1];

  useEffect(() => {
    worker.onmessage = (e) => {
      setResult(e.data);
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    if (!routes || !demos) return;

    worker.postMessage({
      action: 'generate-metadata',
      args: {
        routes: JSON.parse(JSON.stringify(routes)),
        nav: navData,
        demos: demos,
      },
    });
  }, [routes, demos, navData]);

  useEffect(() => {
    if (!routes) return;

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
  }, [keywords, routes]);

  return {
    keywords,
    setKeywords: setter,
    result,
    loading,
    load,
  };
};
