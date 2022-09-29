import { useSidebarData } from 'dumi';
import React, { type FC, type ReactNode } from 'react';
import './heti.scss';
import './index.less';

const Content: FC<{ children: ReactNode }> = (props) => {
  const sidebar = useSidebarData();

  return (
    <div
      className="dumi-default-content"
      data-no-sidebar={!sidebar || undefined}
    >
      {props.children}
    </div>
  );
};

export default Content;
