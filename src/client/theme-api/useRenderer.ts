import { useEffect, useRef } from 'react';
import { useTechStackRuntimeApi, type ISiteContext } from './context';

// maintain all the mounted instance
const map = new Map<string, any>();

export const useRenderer = ({ id, component }: ISiteContext['demos'][1]) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tearDownRef = useRef(() => {});

  const { renderToCanvas } = useTechStackRuntimeApi();
  useEffect(() => {
    async function resolveRender() {
      if (!canvasRef.current || !renderToCanvas || !component) return;
      let instance = map.get(id);
      if (instance) return;
      instance = component instanceof Promise ? await component : component;
      instance = instance.default ?? instance;
      map.set(id, instance);
      const instanceTeardown = await renderToCanvas(
        canvasRef.current,
        instance,
      );
      // remove instance when react component is unmounted
      tearDownRef.current = function () {
        instanceTeardown();
        map.delete(id);
      };
    }
    resolveRender();
  }, [canvasRef, component, renderToCanvas]);

  useEffect(() => () => tearDownRef.current(), []);

  return canvasRef;
};
