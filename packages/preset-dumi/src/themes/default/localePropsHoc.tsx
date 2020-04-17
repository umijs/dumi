import React from 'react';
import Context from './context';

function splitLocaleFromPropsName(name: string) {
  return (name.match(/^(.+)\.([^.]+)$/) || []).slice(1);
}

export default Component => props => (
  <Context.Consumer>
    {({ locale: currentLocale }) => {
      let localeProps = {};

      if (currentLocale) {
        Object.keys(props).forEach(key => {
          const [name, locale] = splitLocaleFromPropsName(key);

          if (!locale || locale === currentLocale) {
            localeProps[name || key] = props[key];
          }
        });
      } else {
        localeProps = props;
      }

      return <Component {...localeProps} />;
    }}
  </Context.Consumer>
);
