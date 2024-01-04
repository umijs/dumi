import { ApplyPluginsType } from 'dumi';
import { useEffect, useRef } from 'react';
import { type ISiteContext } from './context';
import { pluginManager } from './utils';

// maintain all the mounted instance
const map = new Map<string, any>();

export const useRenderer = ({
  id,
  component,
  render,
}: ISiteContext['demos'][1]) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tearDownRef = useRef(() => {});

  useEffect(() => {
    async function resolveRender() {
      if (!canvasRef.current || render?.type !== 'CANCELABLE' || !component)
        return;

      let instance = map.get(id);
      if (instance) return;

      const renderToCanvas = render.plugin
        ? async (canvas: Element, component: any) => {
            const result = pluginManager.applyPlugins({
              type: ApplyPluginsType.modify,
              key: render.plugin!,
              initialValue: { canvas, component },
            });
            return await result;
          }
        : render.func!;

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
  }, [canvasRef, component, render?.type]);

  useEffect(() => () => tearDownRef.current(), []);

  return canvasRef;
};
