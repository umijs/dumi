import Previewer from 'dumi/theme/builtins/Previewer';
import React, { createElement, useContext, type FC } from 'react';
import { Context } from './context';
import type { IPreviewerProps } from './types';

export interface IDumiDemoProps {
  demo: {
    id: string;
    inline?: boolean;
  };
  previewerProps: Omit<IPreviewerProps, 'asset' | 'children'>;
}

export const DumiDemo: FC<IDumiDemoProps> = (props) => {
  const { demos } = useContext(Context);
  const { component, asset } = demos[props.demo.id];

  return (
    <Previewer asset={asset} {...props.previewerProps}>
      {createElement(component)}
    </Previewer>
  );
};
