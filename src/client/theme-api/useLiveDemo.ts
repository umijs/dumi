import { useDemo } from 'dumi';
import {
  createElement,
  useCallback,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import DemoErrorBoundary from './DumiDemo/DemoErrorBoundary';
import type { AgnosticComponentType } from './types';
import { useRenderer } from './useRenderer';

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
  const { context = {}, asset, renderOpts } = demo;
  const [component, setComponent] = useState<AgnosticComponentType>();
  const ref = useRenderer(
    component
      ? {
          ...demo,
          component,
        }
      : demo,
  );

  const [demoNode, setDemoNode] = useState<ReactNode>();

  const [error, setError] = useState<Error | null>(null);
  const setSource = useCallback(
    async (source: Record<string, string>) => {
      const entryFileName = Object.keys(asset.dependencies).find(
        (k) => asset.dependencies[k].type === 'FILE',
      )!;
      let entryFileCode = source[entryFileName];
      const require = (v: string) => {
        if (v in context!) return context![v];
        throw new Error(`Cannot find module: ${v}`);
      };

      if (renderOpts?.compile) {
        try {
          entryFileCode = await renderOpts.compile(entryFileCode, {
            filename: entryFileName,
          });
        } catch (error: any) {
          setError(error);
        }
      }

      if (renderOpts?.renderer) {
        try {
          const exports: AgnosticComponentType = {};
          const module = { exports };
          evalCommonJS(entryFileCode, {
            exports,
            module,
            require,
          });
          setComponent(exports);
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
          const exports: { default?: ComponentType } = {};
          const module = { exports };
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
