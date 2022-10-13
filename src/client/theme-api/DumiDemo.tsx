import { SP_ROUTE_PREFIX } from '@/constants';
import { useSiteData } from 'dumi';
import Previewer from 'dumi/theme/builtins/Previewer';
import React, { createElement, type FC } from 'react';
import type { IPreviewerProps } from './types';

export interface IDumiDemoProps {
  demo: {
    id: string;
    inline?: boolean;
  };
  previewerProps: Omit<IPreviewerProps, 'asset' | 'children'>;
}

export const DumiDemo: FC<IDumiDemoProps> = (props) => {
  const { demos } = useSiteData();
  const { component, asset } = demos[props.demo.id];

  if (props.demo.inline) return createElement(component);

  return (
    <Previewer
      asset={asset}
      demoUrl={
        // allow user override demoUrl by frontmatter
        props.previewerProps.demoUrl ||
        `/${SP_ROUTE_PREFIX}demos/${props.demo.id}`
      }
      {...props.previewerProps}
    >
      {createElement(component)}
    </Previewer>
  );
};
