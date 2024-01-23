import { useDemo, useLiveDemo, useParams } from 'dumi';
import { createElement, useEffect, type FC } from 'react';
import './index.less';

const DemoRenderPage: FC = () => {
  const { id } = useParams();
  const { component } = useDemo(id!) || {};
  const {
    node: liveDemoNode,
    error: liveDemoError,
    setSource,
  } = useLiveDemo(id!);
  const finalNode = liveDemoNode || (component && createElement(component));

  // listen message event for setSource
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

  // notify parent window that compile done
  useEffect(() => {
    if (liveDemoNode || liveDemoError) {
      window.postMessage({
        type: 'dumi.liveDemo.compileDone',
        value: { err: liveDemoError },
      });
    }
  }, [liveDemoNode, liveDemoError]);

  return finalNode;
};

export default DemoRenderPage;
