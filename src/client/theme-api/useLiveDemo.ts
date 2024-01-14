import { useDemo } from 'dumi';
import throttle from 'lodash.throttle';
import {
  createElement,
  useCallback,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import DemoErrorBoundary from './DumiDemo/DemoErrorBoundary';

export const useLiveDemo = (id: string) => {
  const { context, asset, renderOpts } = useDemo(id)!;
  const [demoNode, setDemoNode] = useState<ReactNode>();
  const [error, setError] = useState<Error | null>(null);
  const setSource = useCallback(
    throttle(async (source: Record<string, string>) => {
      const entryFileName = Object.keys(asset.dependencies).find(
        (k) => asset.dependencies[k].type === 'FILE',
      )!;
      const require = (v: string) => {
        if (v in context!) return context![v];
        throw new Error(`Cannot find module: ${v}`);
      };
      const exports: { default?: ComponentType } = {};
      const module = { exports };
      let entryFileCode = source[entryFileName];

      try {
        // load renderToStaticMarkup in async way
        const renderToStaticMarkupDeferred = import('react-dom/server').then(
          ({ renderToStaticMarkup }) => renderToStaticMarkup,
        );

        // compile entry file code
        entryFileCode = await renderOpts!.compile!(entryFileCode, {
          filename: entryFileName,
        });

        // initial component with fake runtime
        new Function('module', 'exports', 'require', entryFileCode)(
          module,
          exports,
          require,
        );

        const newDemoNode = createElement(
          DemoErrorBoundary,
          null,
          createElement(exports.default!),
        );
        const oError = console.error;

        // hijack console.error to avoid useLayoutEffect error
        console.error = (...args) =>
          !args[0].includes('useLayoutEffect does nothing on the server') &&
          oError.apply(console, args);

        // check component is able to render, to avoid show react overlay error
        (await renderToStaticMarkupDeferred)(newDemoNode);
        console.error = oError;

        // set new demo node with passing source
        setDemoNode(newDemoNode);
      } catch (err: any) {
        setError(err);
      }
    }, 500) as (source: Record<string, string>) => Promise<void>,
    [context],
  );

  return { node: demoNode, error, setSource };
};
