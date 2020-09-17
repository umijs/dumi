import { useState, useEffect } from 'react';

export const getDemoRoutePrefix = () => {
  return process.env.PLATFORM_TYPE === 'BASEMENT' ? '/_demos/' : '/~demos/';
};

export const getDemoUrl = (demoId: string) => {
  return `${window.location.origin}${getDemoRoutePrefix()}${demoId}`;
};

/**
 * hooks for get single demo url
 */
export default (demoId: string) => {
  const [url, setUrl] = useState(getDemoUrl(demoId));

  useEffect(() => {
    setUrl(getDemoUrl(demoId));
  }, [demoId]);

  return url;
};
