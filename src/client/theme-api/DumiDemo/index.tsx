import React, { Suspense, type FC } from 'react';
import type { IPreviewerProps } from '../types';
import DumiDemoBlock from './DemoBlock';

export interface IDumiDemoProps {
  demo: {
    id: string;
    inline?: boolean;
  };
  previewerProps: Omit<IPreviewerProps, 'asset' | 'children'>;
}

const InternalDumiDemo = (props: IDumiDemoProps) => (
  <Suspense>
    <DumiDemoBlock {...props} />
  </Suspense>
);

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
