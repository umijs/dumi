import { SP_ROUTE_PREFIX } from '@/constants';
import { useAppData, useDemoData, useSiteData } from 'dumi';

import Previewer from 'dumi/theme/builtins/Previewer';
import React, { createElement, type FC } from 'react';
import type { IPreviewerProps } from '../types';
import DemoErrorBoundary from './DemoErrorBoundary';

export interface IDumiDemoBlockProps {
  demo: {
    id: string;
    inline?: boolean;
  };
  previewerProps: Omit<IPreviewerProps, 'asset' | 'children'>;
}

const DumiDemoBlock: FC<IDumiDemoBlockProps> = (props) => {
  const { historyType } = useSiteData();
  const { basename } = useAppData();
  const demoInfo = useDemoData(props.demo.id);

  // hide debug demo in production
  if (process.env.NODE_ENV === 'production' && props.previewerProps.debug)
    return null;

  if (!demoInfo) {
    return null;
  }

  const { component, asset } = demoInfo;

  const demoNode = (
    <DemoErrorBoundary>{createElement(component)}</DemoErrorBoundary>
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

if (process.env.NODE_ENV === 'development') {
  DumiDemoBlock.displayName = 'DumiDemoBlock';
}

export default DumiDemoBlock;
