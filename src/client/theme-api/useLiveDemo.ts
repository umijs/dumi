import { useDemo } from 'dumi';
import {
  createElement,
  useCallback,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import DemoErrorBoundary from './DumiDemo/DemoErrorBoundary';

export const useLiveDemo = (id: string) => {
  const { context, asset } = useDemo(id)!;
  const [demoNode, setDemoNode] = useState<ReactNode>();
  const [error, setError] = useState<Error | null>(null);
  const setSource = useCallback(
    (source: Record<string, string>) => {
      const entryFileName = Object.keys(asset.dependencies).find(
        (k) => asset.dependencies[k].type === 'FILE',
      )!;
      const entryFileCode = source[entryFileName];
      const require = (v: string) => {
        if (v in context!) return context![v];
        throw new Error(`Cannot find module: ${v}`);
      };
      const exports: { default?: ComponentType } = {};
      const module = { exports };

      // lazy load react-dom/server
      import('react-dom/server').then(({ renderToStaticMarkup }) => {
        try {
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

          // check component is renderable, to avoid show react overlay error
          renderToStaticMarkup(newDemoNode);
          console.error = oError;

          // set new demo node with passing source
          setDemoNode(newDemoNode);
          setError(null);
        } catch (err: any) {
          setError(err);
        }
      });
    },
    [context],
  );

  return { node: demoNode, error, setSource };
};
