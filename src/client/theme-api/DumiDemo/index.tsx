import { SP_ROUTE_PREFIX } from '@/constants';
import { useAppData, useDemo, useSiteData } from 'dumi';
import React, {
  ComponentType,
  createElement,
  useEffect,
  useRef,
  useState,
  type FC,
} from 'react';
import type { IDemoData, IPreviewerProps } from '../types';

import Previewer from 'dumi/theme/builtins/Previewer';
import { useRenderer } from '../useRenderer';
import DemoErrorBoundary from './DemoErrorBoundary';

type DemoGetter = () => Promise<{ demos: Record<string, IDemoData> }>;
type UseDemo = (
  id: string,
  loader?: DemoGetter,
  version?: string,
  routeId?: string,
) => IDemoData | undefined;

export interface IDumiDemoProps {
  demo: {
    id: string;
    inline?: boolean;
    loader?: DemoGetter;
    version?: string;
  };
  previewerProps: Omit<IPreviewerProps, 'asset' | 'children'>;
}

const LazyDemoPlaceholder: FC<{ id: string; onVisible: () => void }> = ({
  id,
  onVisible,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      onVisible();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          onVisible();
        }
      },
      { rootMargin: '1000px 0px' },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [onVisible]);

  return (
    <div id={id} ref={ref} data-dumi-demo-lazy style={{ minHeight: 160 }} />
  );
};

const LoadedDumiDemo = (props: IDumiDemoProps) => {
  const { historyType } = useSiteData();
  const { basename } = useAppData();
  const { id, loader, version } = props.demo;
  const demo = (useDemo as UseDemo)(id, loader, version)!;
  const { component, asset, renderOpts } = demo;

  const { canvasRef } = useRenderer({
    id,
    renderOpts: demo.renderOpts,
    component: demo.component,
  });

  // hide debug demo in production
  if (process.env.NODE_ENV === 'production' && props.previewerProps.debug)
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
  const routeQuery = demo.routeId
    ? `?routeId=${encodeURIComponent(demo.routeId)}`
    : '';

  return (
    <Previewer
      asset={asset}
      demoUrl={
        // allow user override demoUrl by frontmatter
        props.previewerProps.demoUrl ||
        // when use hash route, browser can automatically handle relative paths starting with #
        `${isHashRoute ? `#` : ''}${basename}${SP_ROUTE_PREFIX}demos/${
          props.demo.id
        }${routeQuery}`
      }
      {...props.previewerProps}
    >
      {props.previewerProps.iframe ? null : demoNode}
    </Previewer>
  );
};

const InternalDumiDemo = (props: IDumiDemoProps) => {
  const shouldLazyLoad =
    process.env.NODE_ENV !== 'production' &&
    Boolean(props.demo.loader) &&
    !props.demo.inline;
  const [visible, setVisible] = useState(!shouldLazyLoad);

  if (!visible) {
    return (
      <LazyDemoPlaceholder
        id={props.demo.id}
        onVisible={() => setVisible(true)}
      />
    );
  }

  return <LoadedDumiDemo {...props} />;
};

export const DumiDemo: FC<IDumiDemoProps> = React.memo(
  InternalDumiDemo,
  (prev, next) => {
    // compare length for performance
    return (
      prev.demo.id === next.demo.id &&
      prev.demo.inline === next.demo.inline &&
      prev.demo.version === next.demo.version &&
      JSON.stringify(prev.previewerProps).length ===
        JSON.stringify(next.previewerProps).length
    );
  },
);

if (process.env.NODE_ENV !== 'production') {
  InternalDumiDemo.displayName = 'DumiDemo';
}
