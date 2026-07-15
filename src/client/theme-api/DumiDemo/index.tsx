import { SP_ROUTE_PREFIX } from '@/constants';
import { useAppData, useDemo, useSiteData } from 'dumi';
import React, {
  ComponentType,
  createElement,
  useEffect,
  useState,
  type FC,
} from 'react';
import type { IDemoData, IPreviewerProps } from '../types';

import Previewer from 'dumi/theme/builtins/Previewer';
import { useRenderer } from '../useRenderer';
import DemoErrorBoundary from './DemoErrorBoundary';
import { getDemoHMRRevision, subscribeDemoHMR } from './hmr';

type DemoGetter = () => Promise<{ demos: Record<string, IDemoData> }>;
type UseDemo = (
  id: string,
  loader?: DemoGetter,
  version?: string,
  routeId?: string,
) => IDemoData | undefined;

export interface IDumiDemoProps {
  demo: {
    __dumiUtoopackHMR?: string;
    id: string;
    inline?: boolean;
    loader?: DemoGetter;
    version?: string;
  };
  previewerProps: Omit<IPreviewerProps, 'asset' | 'children'>;
}

function useDemoCacheVersion(
  id: string,
  metadataVersion: string | undefined,
  hmrModuleId: string | undefined,
): string | undefined {
  const hmr =
    process.env.NODE_ENV === 'production' ? undefined : hmrModuleId;
  const [hmrState, setHMRState] = useState(() => ({
    id,
    moduleId: hmr,
    revision: hmr ? getDemoHMRRevision(hmr, id) : 0,
  }));

  useEffect(() => {
    if (!hmr) return;

    const syncRevision = () => {
      const revision = getDemoHMRRevision(hmr, id);
      setHMRState((current) => {
        if (
          current.id === id &&
          current.moduleId === hmr &&
          current.revision === revision
        )
          return current;
        return { id, moduleId: hmr, revision };
      });
    };
    const unsubscribe = subscribeDemoHMR(hmr, id, syncRevision);

    // Re-read after subscribing so a change between render and effect is not lost.
    syncRevision();
    return unsubscribe;
  }, [hmr, id]);

  if (!hmr) return metadataVersion;

  const storedRevision = getDemoHMRRevision(hmr, id);
  const revision =
    hmrState.id === id && hmrState.moduleId === hmr
      ? Math.max(hmrState.revision, storedRevision)
      : storedRevision;

  return `${metadataVersion}:${revision}`;
}

const InternalDumiDemo = (props: IDumiDemoProps) => {
  const { historyType } = useSiteData();
  const { basename } = useAppData();
  const {
    __dumiUtoopackHMR: hmrModuleId,
    id,
    loader,
    version,
  } = props.demo;
  const cacheVersion = useDemoCacheVersion(id, version, hmrModuleId);
  const demo = (useDemo as UseDemo)(id, loader, cacheVersion)!;
  const { component, asset, renderOpts } = demo;
  const previewerProps = hmrModuleId
    ? { ...demo.previewerProps, ...props.previewerProps }
    : props.previewerProps;

  const { canvasRef } = useRenderer({
    id,
    renderOpts: demo.renderOpts,
    component: demo.component,
  });

  // hide debug demo in production
  if (process.env.NODE_ENV === 'production' && previewerProps.debug)
    return null;

  const demoNode = (
    <DemoErrorBoundary>
      {renderOpts?.renderer ? (
        <div ref={canvasRef}></div>
      ) : (
        createElement(component as ComponentType)
      )}
    </DemoErrorBoundary>
  );

  if (props.demo.inline) {
    return demoNode;
  }

  const isHashRoute = historyType === 'hash';
  const routeParams = new URLSearchParams();
  if (hmrModuleId) routeParams.set('dumi-hmr', hmrModuleId);
  // Keep routeId last for compatibility with custom previewers that append
  // their own query string to demoUrl instead of merging URLSearchParams.
  if (demo.routeId) routeParams.set('routeId', demo.routeId);
  const routeQueryString = routeParams.toString();
  const routeQuery = routeQueryString ? `?${routeQueryString}` : '';

  return (
    <Previewer
      asset={asset}
      demoUrl={
        // allow user override demoUrl by frontmatter
        previewerProps.demoUrl ||
        // when use hash route, browser can automatically handle relative paths starting with #
        `${isHashRoute ? `#` : ''}${basename}${SP_ROUTE_PREFIX}demos/${
          props.demo.id
        }${routeQuery}`
      }
      {...previewerProps}
    >
      {previewerProps.iframe ? null : demoNode}
    </Previewer>
  );
};

export function areDumiDemoPropsEqual(
  prev: IDumiDemoProps,
  next: IDumiDemoProps,
): boolean {
  return JSON.stringify(prev) === JSON.stringify(next);
}

export const DumiDemo: FC<IDumiDemoProps> = React.memo(
  InternalDumiDemo,
  areDumiDemoPropsEqual,
);

if (process.env.NODE_ENV !== 'production') {
  InternalDumiDemo.displayName = 'DumiDemo';
}
