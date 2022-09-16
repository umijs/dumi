import React, { type FC } from 'react';
import { DumiDemo, IDumiDemoProps } from './DumiDemo';

export interface IDumiDemoGridProps {
  items: IDumiDemoProps[];
}

export const DumiDemoGrid: FC<IDumiDemoGridProps> = (props) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      {props.items.map((item) => (
        <section key={item.demo.id}>
          <DumiDemo {...item} />
        </section>
      ))}
    </div>
  );
};
