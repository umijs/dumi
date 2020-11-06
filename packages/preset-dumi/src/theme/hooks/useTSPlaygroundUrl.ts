import { useState, useEffect } from 'react';
import LZString from 'lz-string';

const API_ENDPOINTS = {
  'zh-CN': 'https://www.typescriptlang.org/zh/play',
  'en-US': 'https://www.typescriptlang.org/play',
};

/**
 * hooks for generate TypeScript playground url for tsx? code
 */
export default (locale: string, code: string) => {
  const processor = (...args: [string, any]) => {
    const api = /^zh|cn$/.test(args[0]) ? API_ENDPOINTS['zh-CN'] : API_ENDPOINTS['en-US'];

    return `${api}?skipLibCheck=true&jsx=1#code/${LZString.compressToEncodedURIComponent(args[1])}`;
  };
  const [url, setUrl] = useState(processor(locale, code));

  useEffect(() => {
    setUrl(processor(locale, code));
  }, [locale, code]);

  return url;
};
