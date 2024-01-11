import { useDemo, useLiveDemo, useParams } from 'dumi';
import { createElement, useEffect, type FC } from 'react';
import './index.less';

const DemoRenderPage: FC = () => {
  const { id } = useParams();
  const { component } = useDemo(id!) || {};
  const { node: liveDemoNode, setSource } = useLiveDemo(id!);
  const finalNode = liveDemoNode || (component && createElement(component));

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
