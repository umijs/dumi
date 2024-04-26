import { useEffect, useRef, useState } from 'react';
import type { AgnosticComponentType, IDemoData } from './types';
import { getAgnosticComponentModule } from './utils';

// maintain all the mounted instance
const map = new Map<
  string,
  { teardown?: () => void; hostElement?: HTMLElement }
>();

export interface UseRendererOptions {
  id: string;
  component?: AgnosticComponentType;
  renderOpts: IDemoData['renderOpts'];
  onResolved?: () => void;
}

export const useRenderer = ({
  id,
  component,
  renderOpts,
  onResolved,
}: UseRendererOptions) => {
  const [deferedComponent, setComponent] =
    useState<AgnosticComponentType | null>(
      component ? getAgnosticComponentModule(component) : null,
    );

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
      if (!canvasRef.current || !renderer || !deferedComponent) return;
      const legacyHandler = map.get(id);
      if (resolving.current) return;
      resolving.current = true;

      const legacyTeardown = legacyHandler?.teardown;
      const comp = await deferedComponent;
      const hostElement = document.createElement('div');
      try {
        canvasRef.current.appendChild(hostElement);
        const teardown = await renderer(hostElement, comp);
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
      } finally {
        resolving.current = false;
        onResolved?.();
      }
    }

    resolveRender();
  }, [canvasRef.current, deferedComponent, renderer]);

  useEffect(() => () => teardownRef.current(), []);

  return { canvasRef, setComponent };
};
