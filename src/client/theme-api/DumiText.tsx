import { useRouteMeta, useTabMeta } from 'dumi';
import React, { type FC } from 'react';

export const DumiText: FC<{ id: number }> = (props) => {
  const routeMeta = useRouteMeta();
  const tabMeta = useTabMeta();
  const { texts } = tabMeta || routeMeta;

  return <>{texts[props.id].value}</>;
};
