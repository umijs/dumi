import type { IPreviewerProps } from 'dumi';
import React, { type FC } from 'react';

const Previewer: FC<IPreviewerProps> = (props) => {
  return <div style={{ border: '1px solid #eee' }}>{props.children}</div>;
};

export default Previewer;
