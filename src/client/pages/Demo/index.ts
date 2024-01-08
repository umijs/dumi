import { IDemoData, useDemo, useLiveDemo, useParams } from 'dumi';
import { createElement, useEffect, type FC } from 'react';
import { useRenderer } from '../../theme-api/useRenderer';
import './index.less';

const DemoRenderPage: FC = () => {
  const { id } = useParams();

  const demo: IDemoData | Record<string, never> = useDemo(id!) || {};
  const { node: liveDemoNode, setSources } = useLiveDemo(id!);

  const { component, render } = demo;

  const ref = useRenderer(demo);

  const cancelable = render?.type === 'CANCELABLE';

  const finalNode =
    liveDemoNode ||
    (cancelable
      ? createElement('div', {}, createElement('div', { ref }))
      : component && createElement(component));

  useEffect(() => {
    const handler = (
      ev: MessageEvent<{
        type: string;
        value: Parameters<typeof setSources>[0];
      }>,
    ) => {
      if (ev.data.type === 'dumi.liveDemo.setSources') {
        setSources(ev.data.value);
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, [setSources]);

  return finalNode;
};

export default DemoRenderPage;
