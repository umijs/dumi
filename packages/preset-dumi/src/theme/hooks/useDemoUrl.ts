import { useState, useEffect } from 'react';

// functional for testing
function isBMW() {
  return process.env.PLATFORM_TYPE === 'BASEMENT';
}

/**
 * get demo route name
 * @note  also use this function in CLI, do not use BOM inside
 */
export const getDemoRouteName = () => {
  return isBMW() ? `_demos` : `~demos`;
};

/**
 * get single demo url
 * @param demoId  demo identifier
 */
export const getDemoUrl = (demoId: string) => {
  const { location } = window;
  const [base, hashRoute] = location.href.split(/#\//);
  const isHashRoute = typeof hashRoute === 'string';

  return [
    isHashRoute ? `${base}#` : window.location.origin,
    // compatible with (empty), /base & /base/
    `${(window as any)?.routerBase || ''}/`.replace(/\/\/$/, '/'),
    getDemoRouteName(),
    '/',
    demoId,
    isBMW() ? '/index.html' : '',
  ].join('');
};

/**
 * hooks for get single demo url
 */
export default (demoId: string) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(getDemoUrl(demoId));
  }, [demoId]);

  return url;
};
