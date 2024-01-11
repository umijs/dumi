import { SP_ROUTE_PREFIX } from '@/constants';
import { useAppData, useDemo, useSiteData } from 'dumi';
import React, { createContext, createElement, useState, type FC } from 'react';
import type { IDemoData, IPreviewerProps } from '../types';

import Previewer from 'dumi/theme/builtins/Previewer';
import { useLiveDemo } from '../useLiveDemo';
import DemoErrorBoundary from './DemoErrorBoundary';

export interface IDumiDemoProps {
  demo: {
    id: string;
    inline?: boolean;
  };
  previewerProps: Omit<IPreviewerProps, 'asset' | 'children'>;
}

export const DumiDemoContext = createContext<{
  demo?: IDemoData;
  combineError?: Error | null;
  setEditorError?: (err: Error | null) => void;
  setLiveDemoSources?: (sources: Record<string, string>) => void;
}>({});

const InternalDumiDemo = (props: IDumiDemoProps) => {
  const { historyType } = useSiteData();
  const { basename } = useAppData();
  const id = props.demo.id;
  const demo = useDemo(id)!;
  const { component, asset } = demo;

  const {
    node: newDemoNode,
    error: liveDemoError,
    setSources: setLiveDemoSources,
  } = useLiveDemo(id);

  const [editorError, setEditorError] = useState<Error | null>(null);

  // hide debug demo in production
  if (process.env.NODE_ENV === 'production' && props.previewerProps.debug)
    return null;

  const demoNode = (
    <DemoErrorBoundary>
      {newDemoNode || createElement(component)}
    </DemoErrorBoundary>
  );

  if (props.demo.inline) {
    return demoNode;
  }

  const isHashRoute = historyType === 'hash';

  return (
    <DumiDemoContext.Provider
      value={{
        demo,
        setLiveDemoSources,
        setEditorError,
        combineError: liveDemoError || editorError,
      }}
    >
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
    </DumiDemoContext.Provider>
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
