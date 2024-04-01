import { useDemo } from 'dumi';
import throttle from 'lodash.throttle';
import {
  createElement,
  useCallback,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from 'react';
import DemoErrorBoundary from './DumiDemo/DemoErrorBoundary';
import type { AgnosticComponentType } from './types';
import { useImportMap } from './useImportMap';
import { useRenderer } from './useRenderer';
import { useSandbox } from './useSandbox';
import { SUPPORTED_MODULE } from './utils';

const THROTTLE_WAIT = 500;

export const useLiveDemo = (
  id: string,
  opts?: { containerRef?: RefObject<HTMLElement>; iframe?: boolean },
) => {
  const demo = useDemo(id)!;
  const [loading, setLoading] = useState(false);
  const loadingTimer = useRef<number>();
  const taskToken = useRef<number>();

  const { context = {}, asset, renderOpts } = demo;
  const [component, setComponent] = useState<AgnosticComponentType>();
  const ref = useRenderer(
    component
      ? {
          id,
          ...demo,
          component,
        }
      : Object.assign(demo, { id }),
  );

  const [demoNode, setDemoNode] = useState<ReactNode>();

  const [error, setError] = useState<Error | null>(null);

  const { importMap, internalImportMap, updateImportMap } = useImportMap(demo);

  const sandbox = useSandbox(internalImportMap, SUPPORTED_MODULE);

  const setSource = useCallback(
    throttle(
      async (source: Record<string, string>) => {
        // set loading status if still compiling after 499ms
        loadingTimer.current = window.setTimeout(
          () => {
            setLoading(true);
          },
          // make sure timer be fired before next throttle
          THROTTLE_WAIT - 1,
        );

        function resetLoadingStatus() {
          clearTimeout(loadingTimer.current);
          setLoading(false);
        }

        if (opts?.iframe && opts?.containerRef?.current) {
          const iframeWindow =
            opts.containerRef.current.querySelector('iframe')!.contentWindow!;

          await new Promise<void>((resolve) => {
            const handler = (
              ev: MessageEvent<{
                type: string;
                value: { err: null | Error };
              }>,
            ) => {
              if (ev.data.type?.startsWith('dumi.liveDemo.compileDone')) {
                iframeWindow.removeEventListener('message', handler);
                setError(ev.data.value.err);
                resolve();
              }
            };

            iframeWindow.addEventListener('message', handler);
            iframeWindow.postMessage({
              type: 'dumi.liveDemo.setSource',
              value: source,
            });
          });
        } else {
          const entryFileName = Object.keys(asset.dependencies).find(
            (k) => asset.dependencies[k].type === 'FILE',
          )!;

          const token = (taskToken.current = Math.random());
          let entryFileCode = source[entryFileName];

          sandbox.init();

          if (renderOpts?.compile) {
            try {
              entryFileCode = await renderOpts.compile(entryFileCode, {
                filename: entryFileName,
                modules: SUPPORTED_MODULE,
              });
            } catch (error: any) {
              setError(error);
              resetLoadingStatus();
              return;
            }
          }

          if (renderOpts?.renderer && renderOpts?.compile) {
            try {
              const exports: AgnosticComponentType = await sandbox.exec(
                entryFileCode,
              );
              setComponent(exports);
              setDemoNode(createElement('div', { ref }));
              setError(null);
            } catch (err: any) {
              setError(err);
            }
            resetLoadingStatus();
            return;
          }

          try {
            // load renderToStaticMarkup in async way
            const renderToStaticMarkupDeferred = import(
              'react-dom/server'
            ).then(({ renderToStaticMarkup }) => renderToStaticMarkup);

            // skip current task if another task is running
            if (token !== taskToken.current) return;
            const exports: { default?: ComponentType } = await sandbox.exec(
              entryFileCode,
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
            setError(null);
          } catch (err: any) {
            setError(err);
          }
        }
        resetLoadingStatus();
      },
      THROTTLE_WAIT,
      { leading: true },
    ) as (source: Record<string, string>) => Promise<void>,
    [context, asset, renderOpts],
  );

  return {
    node: demoNode,
    loading,
    error,
    setSource,
    updateImportMap,
    importMap,
  };
};
