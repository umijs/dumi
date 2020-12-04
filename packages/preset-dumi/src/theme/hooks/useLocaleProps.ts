import { useState, useEffect } from 'react';

/**
 * transform props by current locale
 * @note  such as title.zh-CN => title
 */
export default <T>(locale: string, props: T) => {
  const processor = (...args: [string, any]) => {
    const result = {} as T;

    Object.keys(args[1]).forEach(key => {
      const [name, keyLocale] = (key.match(/^(.+)\.([^_]+)$/) || []).slice(1);

      if (!keyLocale || keyLocale === args[0]) {
        result[name || key] = args[1][key];
      }
    });

    return result;
  };
  const [localeProps, setLocaleProps] = useState(processor(locale, props));

  useEffect(() => {
    setLocaleProps(processor(locale, props));
  }, [locale, props]);

  return localeProps;
};
