import { useDemo, useRenderer } from 'dumi';
import {
  createElement,
  useCallback,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import DemoErrorBoundary from './DumiDemo/DemoErrorBoundary';

type CommonJSContext = {
  module: any;
  exports: {
    default?: any;
  };
  require: any;
};

function evalCommonJS(
  js: string,
  { module, exports, require }: CommonJSContext,
) {
  new Function('module', 'exports', 'require', js)(module, exports, require);
}

export const useLiveDemo = (id: string) => {
  const demo = useDemo(id)!;
  const { context = {}, asset, runtime } = demo;

  const [component, setComponent] = useState<any>();
  const ref = useRenderer(
    component
      ? {
          ...demo,
          component,
        }
      : demo,
  );

  const runtimePlugin = runtime?.plugin;

  const [demoNode, setDemoNode] = useState<ReactNode>(
    runtime?.renderType === 'CANCELABLE'
      ? createElement('div', { ref })
      : undefined,
  );
  const [error, setError] = useState<Error | null>(null);

  const setSources = useCallback(
    (sources: Record<string, string>) => {
      const entryFileName = Object.keys(asset.dependencies).find(
        (k) => asset.dependencies[k].type === 'FILE',
      )!;
      const entryFileCode = sources[entryFileName];
      const require = (v: string) => {
        if (v in context) return context[v];
        throw new Error(`Cannot find module: ${v}`);
      };
      const exports: { default?: ComponentType } = {};
      const module = { exports };

      if (runtimePlugin?.loadCompiler) {
        try {
          evalCommonJS(entryFileCode, {
            exports,
            module,
            require,
          });
          setComponent(exports.default!);
          setDemoNode(createElement('div', { ref }));
          setError(null);
        } catch (err: any) {
          setError(err);
        }
        return;
      }

      // lazy load react-dom/server
      import('react-dom/server').then(({ renderToStaticMarkup }) => {
        try {
          // initial component with fake runtime
          evalCommonJS(entryFileCode, {
            exports,
            module,
            require,
          });
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

          // set new demo node with passing sources
          setDemoNode(newDemoNode);
          setError(null);
        } catch (err: any) {
          setError(err);
        }
      });
    },
    [context],
  );

  return { node: demoNode, error, setSources };
};
