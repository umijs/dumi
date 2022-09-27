import { DumiDemo, useRouteMeta } from 'dumi';
import React, { useState, type FC } from 'react';
import type { IDumiDemoProps } from './DumiDemo';

export interface IDumiDemoGridProps {
  items: IDumiDemoProps[];
}

export const DumiDemoGrid: FC<IDumiDemoGridProps> = (props) => {
  const { frontmatter: fm } = useRouteMeta();
  const [cols] = useState(() => {
    const cols: IDumiDemoProps[][] = [];

    if (fm.demo?.cols && fm.demo.cols > 1) {
      for (let i = 0; i < props.items.length; i += fm.demo.cols) {
        props.items.slice(i, i + fm.demo.cols).forEach((item, j) => {
          cols[j] ??= [];
          cols[j].push(item);
        });
      }

      return cols;
    } else {
      cols.push(props.items);
    }

    return cols;
  });

  return (
    <div style={{ display: 'flex', margin: -8 }}>
      {cols.map((col, i) => (
        <section style={{ flex: 1, padding: 8 }} key={String(i)}>
          {col.map((item) => (
            <DumiDemo key={item.demo.id} {...item} />
          ))}
        </section>
      ))}
    </div>
  );
};
