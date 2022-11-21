import { SP_ROUTE_PREFIX } from '@/constants';
import { useAppData } from 'dumi';
import { useEffect, useState } from 'react';

export const getDemoUrl = (
  demoId: string,
  basename?: string,
  htmlSuffix?: boolean,
) => {
  const {
    location: { href, origin },
  } = window;
  const [base, hashRoute] = href.split(/#\//);
  const isHashRoute = typeof hashRoute === 'string';
  const isEmptyBase = !basename || basename === '/';

  return [
    isHashRoute ? `${base}#` : origin,
    isEmptyBase ? '/' : `/${basename.replace(/^\/|\/$/g, '')}/`,
    SP_ROUTE_PREFIX,
    'demos/',
    demoId,
    `${htmlSuffix ? '.html' : ''}`,
  ].join('');
};

/**
 *
 * get demo url
 */
export const useDemoUrl = (demoId: string) => {
  const { basename } = useAppData();
  const [demoUrl, setDemoUrl] = useState('');

  useEffect(() => {
    if (demoId) {
      const url = getDemoUrl(demoId, basename);
      setDemoUrl(url);
    }
  }, [basename]);

  return demoUrl;
};
