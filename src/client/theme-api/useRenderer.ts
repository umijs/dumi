import { useEffect, useRef } from 'react';
import type {
  AgnosticComponentModule,
  IDemoCancelableFn,
  IDemoData,
} from './types';

// maintain all the mounted instance
const map = new Map<
  string,
  { teardown?: () => void; hostElement?: HTMLElement }
>();

export type UseRendererOptions = Parameters<IDemoCancelableFn>[2] & {
  onResolved?: () => void;
};

export const useRenderer = (
  { id, component, renderOpts }: IDemoData & { id: string },
  options?: UseRendererOptions,
) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const teardownRef = useRef(() => {});

  const prevCanvas = useRef(canvasRef.current);

  const resolving = useRef(false);

  if (prevCanvas.current !== canvasRef.current) {
    if (prevCanvas.current === null) {
      // When first render, component maintained by the parent component userRenderer may be removed.
      // The hosted element should be added back
      const handler = map.get(id);
      if (handler?.teardown && handler?.hostElement && canvasRef.current) {
        canvasRef.current.appendChild(handler.hostElement);
        teardownRef.current = handler.teardown;
      }
    }
    prevCanvas.current = canvasRef.current;
  }

  const renderer = renderOpts?.renderer;

  useEffect(() => {
    async function resolveRender() {
      if (!canvasRef.current || !renderer || !component) return;
      const legacyHandler = map.get(id);
      if (resolving.current) return;
      resolving.current = true;

      const legacyTeardown = legacyHandler?.teardown;

      let module: AgnosticComponentModule =
        component instanceof Promise ? await component : component;
      module = module.default ?? module;
      const hostElement = document.createElement('div');
      try {
        canvasRef.current.appendChild(hostElement);
        const teardown = await renderer(hostElement, module, options);
        legacyTeardown?.();
        legacyHandler?.hostElement?.remove();
        // remove instance when react component is unmounted
        teardownRef.current = function () {
          teardown();
          hostElement.remove();
          map.delete(id);
        };
        map.set(id, {
          teardown: teardownRef.current,
          hostElement,
        });
      } catch (error) {
        hostElement.remove();
        options?.onInitError?.(error as Error);
      } finally {
        resolving.current = false;
        options?.onResolved?.();
      }
    }

    resolveRender();
  }, [canvasRef.current, component, renderer]);

  useEffect(() => () => teardownRef.current(), []);

  return canvasRef;
};
