import { DumiDemo, useRouteMeta } from 'dumi';
import React, { useCallback, useEffect, useState, type FC } from 'react';
import type { IDumiDemoProps } from './DumiDemo';
import type { IRouteMeta } from './types';

export interface IDumiDemoGridProps {
  items: IDumiDemoProps[];
}

export const DumiDemoGrid: FC<IDumiDemoGridProps> = (props) => {
  const { frontmatter: fm } = useRouteMeta();
  const generator = useCallback(
    (fm: IRouteMeta['frontmatter'], oItems: typeof props.items) => {
      const cols: IDumiDemoProps[][] = [];
      const items =
        process.env.NODE_ENV === 'production'
          ? // hide debug demo in production
            oItems.filter((d) => !d.previewerProps.debug)
          : oItems;

      if (
        fm.demo?.cols &&
        fm.demo.cols > 1 &&
        // compatible for ssr env
        (typeof window === 'undefined' || window.innerWidth > 1024)
      ) {
        for (let i = 0; i < items.length; i += fm.demo.cols) {
          items.slice(i, i + fm.demo.cols).forEach((item, j) => {
            cols[j] ??= [];
            cols[j].push(item);
          });
        }

        return cols;
      } else {
        cols.push(items);
      }

      return cols;
    },
    [],
  );
  const [cols, setCols] = useState(() => generator(fm, props.items));

  useEffect(() => {
    const handler = () => setCols(generator(fm, props.items));

    window.addEventListener('resize', handler);
    handler();

    return () => window.removeEventListener('resize', handler);
  }, [props.items, fm.demo]);

  return (
    <div style={{ display: 'flex', margin: -8 }} data-dumi-demo-grid>
      {cols.map((col, i) => (
        <section style={{ flex: 1, padding: 8, width: 0 }} key={String(i)}>
          {col.map((item) => (
            <DumiDemo key={item.demo.id} {...item} />
          ))}
        </section>
      ))}
    </div>
  );
};
