import { useDemo, useLiveDemo, useParams, useRenderer } from 'dumi';
import { ComponentType, createElement, useEffect, type FC } from 'react';
import './index.less';

const DemoRenderPage: FC = () => {
  const { id } = useParams();
  const demo = useDemo(id!);

  const canvasRef = useRenderer(demo!);

  const { component, renderOpts } = demo || {};

  const { node: liveDemoNode, setSource } = useLiveDemo(id!);

  const finalNode =
    liveDemoNode ||
    (renderOpts?.renderer
      ? createElement('div', { ref: canvasRef })
      : createElement(component as ComponentType));

  useEffect(() => {
    const handler = (
      ev: MessageEvent<{
        type: string;
        value: Parameters<typeof setSource>[0];
      }>,
    ) => {
      if (ev.data.type === 'dumi.liveDemo.setSource') {
        setSource(ev.data.value);
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, [setSource]);

  return finalNode;
};

export default DemoRenderPage;
