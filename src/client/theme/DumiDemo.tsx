import type { IDumiDemoProps } from '@/types';
import { createElement, useContext, type FC } from 'react';
import { Context } from './context';

export const DumiDemo: FC<IDumiDemoProps> = (props) => {
  const { demos } = useContext(Context);
  const { component } = demos[props.demo.id];

  return createElement(component);
};
