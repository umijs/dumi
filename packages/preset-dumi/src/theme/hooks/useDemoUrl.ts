import { useState, useEffect } from 'react';

// functional for testing
function isBMW() {
  return process.env.PLATFORM_TYPE === 'BASEMENT';
}

export const getDemoRoutePrefix = () => {
  return isBMW() ? '/_demos/' : '/~demos/';
};

export const getDemoUrl = (demoId: string) => {
  return `${window.location.origin}${getDemoRoutePrefix()}${demoId}${isBMW() ? '/index.html' : ''}`;
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
