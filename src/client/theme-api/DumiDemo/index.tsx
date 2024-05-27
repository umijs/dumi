import { SP_ROUTE_PREFIX } from '@/constants';
import { useAppData, useDemo, useSiteData } from 'dumi';
import React, { ComponentType, createElement, type FC } from 'react';
import type { IPreviewerProps } from '../types';

import Previewer from 'dumi/theme/builtins/Previewer';
import { useRenderer } from '../useRenderer';
import DemoErrorBoundary from './DemoErrorBoundary';

export interface IDumiDemoProps {
  demo: {
    id: string;
    inline?: boolean;
  };
  previewerProps: Omit<IPreviewerProps, 'asset' | 'children'>;
}

const InternalDumiDemo = (props: IDumiDemoProps) => {
  const { historyType } = useSiteData();
  const { basename } = useAppData();
  const id = props.demo.id;
  const demo = useDemo(id)!;
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

  return (
    <Previewer
      asset={asset}
      demoUrl={
        // allow user override demoUrl by frontmatter
        props.previewerProps.demoUrl ||
        // when use hash route, browser can automatically handle relative paths starting with #
        `${isHashRoute ? `#` : ''}${basename}${SP_ROUTE_PREFIX}demos/${
          props.demo.id
        }`
      }
      {...props.previewerProps}
    >
      {props.previewerProps.iframe ? null : demoNode}
    </Previewer>
  );
};

export const DumiDemo: FC<IDumiDemoProps> = React.memo(
  InternalDumiDemo,
  (prev, next) => {
    // compare length for performance
    return JSON.stringify(prev).length === JSON.stringify(next).length;
  },
);

if (process.env.NODE_ENV !== 'production') {
  InternalDumiDemo.displayName = 'DumiDemo';
}
