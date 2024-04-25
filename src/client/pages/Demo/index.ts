import { useDemo, useLiveDemo, useParams } from 'dumi';
import { ComponentType, createElement, useEffect, type FC } from 'react';
import { useRenderer } from '../../theme-api/useRenderer';
import './index.less';

const DemoRenderPage: FC = () => {
  const params = useParams();
  const id = params.id!;

  const demo = useDemo(id)!;
  const { canvasRef } = useRenderer({
    id,
    component: demo.component,
    renderOpts: demo.renderOpts,
  });

  const { component, renderOpts } = demo || {};

  const {
    node: liveDemoNode,
    setSource,
    error: liveDemoError,
    loading,
  } = useLiveDemo(id!);

  const finalNode =
    liveDemoNode ||
    (renderOpts?.renderer
      ? createElement('div', { ref: canvasRef })
      : component && createElement(component as ComponentType));

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
    if (!loading && (liveDemoError || liveDemoNode)) {
      window.postMessage({
        type: 'dumi.liveDemo.compileDone',
        value: { err: liveDemoError },
      });
    }
  }, [liveDemoError, liveDemoNode, loading]);

  return finalNode;
};

export default DemoRenderPage;
