import { useDemo, useLiveDemo, useLocation, useParams } from 'dumi';
import {
  ComponentType,
  createElement,
  useEffect,
  useState,
  type FC,
} from 'react';
import {
  getDemoHMRRevision,
  subscribeDemoHMR,
} from '../../theme-api/DumiDemo/hmr';
import type { IDemoData } from '../../theme-api/types';
import { useRenderer } from '../../theme-api/useRenderer';
import './index.less';

type DemoGetter = () => Promise<{ demos: Record<string, IDemoData> }>;
type UseDemo = (
  id: string,
  loader?: DemoGetter,
  version?: string,
  routeId?: string,
) => IDemoData | undefined;

function useDemoHMRRevision(
  moduleId: string | undefined,
  id: string,
): number {
  const hmr = process.env.NODE_ENV === 'production' ? undefined : moduleId;
  const revision = hmr ? getDemoHMRRevision(hmr, id) : 0;
  const [, setHMRState] = useState(() => ({ id, moduleId: hmr, revision }));

  useEffect(() => {
    if (!hmr) return;

    let observedRevision = revision;
    const syncRevision = () => {
      const nextRevision = getDemoHMRRevision(hmr, id);

      if (nextRevision === observedRevision) return;

      observedRevision = nextRevision;
      setHMRState((current) => {
        if (
          current.id === id &&
          current.moduleId === hmr &&
          current.revision === nextRevision
        )
          return current;

        return { id, moduleId: hmr, revision: nextRevision };
      });
    };
    const unsubscribe = subscribeDemoHMR(hmr, id, syncRevision);

    // Re-read after subscribing so a change between render and effect is not lost.
    syncRevision();
    return unsubscribe;
  }, [hmr, id, revision]);

  return revision;
}

const DemoRenderPage: FC = () => {
  const params = useParams();
  const { search } = useLocation();
  const id = params.id!;
  const routeParams = new URLSearchParams(search);
  const routeId = routeParams.get('routeId') || undefined;
  const hmrModuleId = routeParams.get('dumi-hmr') || undefined;
  const hmrRevision = useDemoHMRRevision(hmrModuleId, id);
  const cacheVersion = hmrRevision
    ? `dumi-hmr:${hmrRevision}:route=${routeId ?? ''}`
    : undefined;

  const demo = (useDemo as UseDemo)(id, undefined, cacheVersion, routeId)!;
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
