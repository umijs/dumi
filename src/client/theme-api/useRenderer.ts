import { useEffect, useRef } from 'react';
import type {
  AgnosticComponentModule,
  AgnosticComponentType,
  IDemoData,
} from './types';
import { getAgnosticComponentModule } from './utils';

// maintain all the mounted instance
const map = new Map<
  string,
  { teardown?: () => void; hostElement?: HTMLElement }
>();

export interface UseRendererOptions {
  id: string;
  deferedComponent?: AgnosticComponentType;
  component?: AgnosticComponentModule;
  renderOpts: IDemoData['renderOpts'];
  onResolved?: () => void;
}

export const useRenderer = ({
  id,
  deferedComponent,
  component,
  renderOpts,
  onResolved,
}: UseRendererOptions) => {
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
  const preflight = renderOpts?.preflight;
  const shouldPreflight = !!(deferedComponent && preflight);
  const comp =
    component ??
    (deferedComponent && getAgnosticComponentModule(deferedComponent));

  useEffect(() => {
    async function resolveRender() {
      if (!canvasRef.current || !renderer || !comp) return;
      const legacyHandler = map.get(id);
      if (resolving.current) return;
      resolving.current = true;

      try {
        const legacyTeardown = legacyHandler?.teardown;
        const mod = await comp;
        if (shouldPreflight) {
          await preflight?.(mod);
        }
        const hostElement = document.createElement('div');
        try {
          canvasRef.current.appendChild(hostElement);
          const teardown = await renderer(hostElement, mod, {
            onRuntimeError: (error) => {
              throw error;
            },
          });
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
          throw error;
        }
      } finally {
        resolving.current = false;
        onResolved?.();
      }
    }

    resolveRender();
  }, [canvasRef.current, comp, renderer]);

  useEffect(() => () => teardownRef.current(), []);

  return canvasRef;
};
