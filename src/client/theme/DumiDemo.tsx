import { createElement, useContext, type FC } from 'react';
import { Context } from './context';

export const DumiDemo: FC<{ id: string }> = (props) => {
  const { demos } = useContext(Context);
  const { component } = demos[props.id];

  return createElement(component);
};
