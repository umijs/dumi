import React from 'react';
import './Badge.less';

export default ({ children, ...props }) => (
  <span className="__dumi-default-badge" {...props}>
    {children}
  </span>
);
