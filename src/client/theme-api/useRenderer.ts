import { ApplyPluginsType } from 'dumi';
import { useEffect, useRef } from 'react';
import type { IDemoData } from './types';
import { pluginManager } from './utils';

// maintain all the mounted instance
const map = new Map<string, any>();

export const useRenderer = ({
  id,
  component,
  runtime,
}: IDemoData | Record<string, never>) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tearDownRef = useRef(() => {});

  const prevComponent = useRef(component);

  // forcibly destroyed
  if (prevComponent.current !== component) {
    tearDownRef?.current();
    prevComponent.current = component;
  }

  const renderPlugin = runtime?.plugin?.render;

  useEffect(() => {
    async function resolveRender() {
      if (!canvasRef.current || !renderPlugin || !component) return;

      let instance = map.get(id);
      if (instance) return;

      const renderToCanvas = async (canvas: Element, component: any) => {
        const result = pluginManager.applyPlugins({
          type: ApplyPluginsType.modify,
          key: renderPlugin!,
          initialValue: { canvas, component },
        });
        return await result;
      };

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
  }, [canvasRef, component, renderPlugin]);

  useEffect(() => () => tearDownRef.current(), []);

  return canvasRef;
};
