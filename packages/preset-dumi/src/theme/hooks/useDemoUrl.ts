import { useState, useEffect, useContext } from 'react';
import context from '../context';

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
 * @param htmlSuffix true when `exportStatic: { htmlSuffix: true }`
 */
export const getDemoUrl = (demoId: string, htmlSuffix?: boolean) => {
  const {
    location: { href, origin },
  } = window;
  const [base, hashRoute] = href.split(/#\//);
  const isHashRoute = typeof hashRoute === 'string';

  return [
    isHashRoute ? `${base}#` : origin,
    // compatible with (empty), /base & /base/
    `${(window as any)?.routerBase || ''}/`.replace(/\/\/$/, '/'),
    getDemoRouteName(),
    '/',
    demoId,
    `${htmlSuffix ? '.html' : ''}`,
  ].join('');
};

/**
 * hooks for get single demo url
 */
export default (demoId: string) => {
  const { config } = useContext(context);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(getDemoUrl(demoId, config.exportStatic && config.exportStatic.htmlSuffix));
  }, [demoId, config]);

  return url;
};
