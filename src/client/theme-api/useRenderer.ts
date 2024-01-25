import { useEffect, useRef } from 'react';
import type { AgnosticComponentModule, IDemoData } from './types';

// maintain all the mounted instance
const map = new Map<string, any>();

export const useRenderer = ({
  id,
  component,
  renderOpts,
}: IDemoData & { id: string }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const teardownRef = useRef(() => {});

  const prevComponent = useRef(component);

  // forcibly destroyed
  if (prevComponent.current !== component) {
    const teardown = map.get(id);
    teardown?.();
    prevComponent.current = component;
  }

  const renderer = renderOpts?.renderer;

  useEffect(() => {
    async function resolveRender() {
      if (!canvasRef.current || !renderer || !component) return;
      if (map.get(id)) return;

      map.set(id, () => {});
      let module: AgnosticComponentModule =
        component instanceof Promise ? await component : component;
      module = module.default ?? module;

      const teardown = await renderer(canvasRef.current, module);

      // remove instance when react component is unmounted
      teardownRef.current = function () {
        teardown();
        map.delete(id);
      };
      map.set(id, teardownRef.current);
    }

    resolveRender();
  }, [canvasRef.current, component, renderer]);

  useEffect(() => () => teardownRef.current(), []);

  return canvasRef;
};
