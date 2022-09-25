import React, { type FC, type ReactNode } from 'react';

const Content: FC<{ children: ReactNode }> = (props) => {
  return (
    <div style={{ flex: 1, overflow: 'hidden', padding: 24 }}>
      {props.children}
    </div>
  );
};

export default Content;
