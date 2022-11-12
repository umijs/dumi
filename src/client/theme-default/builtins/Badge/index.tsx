import React, { type FC, type ReactNode } from 'react';
import './index.less';

const Badge: FC<{
  children: ReactNode;
  type: 'info' | 'warning' | 'error' | 'success';
}> = (props) => <span className="dumi-default-badge" {...props} />;

export default Badge;
