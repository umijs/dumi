import type { IDumiDemoGridProps } from '@/types';
import React, { type FC } from 'react';
import { DumiDemo } from './DumiDemo';

export const DumiDemoGrid: FC<IDumiDemoGridProps> = (props) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      {props.demos.map((demo) => (
        <section key={demo.id}>
          <DumiDemo demo={demo} />
        </section>
      ))}
    </div>
  );
};
