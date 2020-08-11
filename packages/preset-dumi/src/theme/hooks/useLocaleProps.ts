import { useState, useEffect } from 'react';

/**
 * transform props by current locale
 * @note  such as title.zh-CN => title
 */
export default <T>(locale: string, props: T) => {
  const processor = (...args: [string, any]) => {
    let result = {} as T;

    if (args[0]) {
      Object.keys(args[1]).forEach(key => {
        const [name, locale] = (key.match(/^(.+)\.([^.]+)$/) || []).slice(1);

        if (!locale || locale === args[0]) {
          result[name || key] = args[1][key];
        }
      });
    } else {
      result = args[1];
    }

    return result;
  };
  const [localeProps, setLocaleProps] = useState(processor(locale, props));

  useEffect(() => {
    setLocaleProps(processor(locale, props));
  }, []);

  return localeProps;
};
