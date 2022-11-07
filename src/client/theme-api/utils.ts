import { useAppData, useIntl, useSiteData } from 'dumi';
import { useEffect, useLayoutEffect, useState } from 'react';
import type { IRoutesById } from './types';

export const useLocaleDocRoutes = () => {
  const intl = useIntl();
  const { routes } = useAppData();
  const { locales } = useSiteData();
  const [localeDocRoutes] = useState(() => {
    const reversedLocales = locales.slice().reverse();

    return Object.values(routes).reduce<IRoutesById>((ret, route) => {
      const matched = reversedLocales.find((locale) =>
        'suffix' in locale
          ? // suffix mode
            route.path!.endsWith(locale.suffix)
          : // base mode
            route.path!.startsWith(locale.base.slice(1)),
      )!;

      if (route.parentId === 'DocLayout' && matched.id === intl.locale) {
        ret[route.id] = route;
      }

      return ret;
    }, {});
  });

  return localeDocRoutes;
};

/**
 * 在 react 18 中需要新的 render 方式，这个函数用来处理不同的 jsx 模式。
 * @param version react version
 * @returns code string
 */
export const genReactRenderCode = (version: string): string => {
  const annotation = `/**
 * This is an auto-generated demo by dumi
 * if you think it is not working as expected,
 * please report the issue at
 * https://github.com/umijs/dumi/issues
 */`;

  if (version.startsWith('18.') || version === 'latest') {
    return `${annotation}

import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);`;
  }
  return `${annotation}

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);`;
};

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
