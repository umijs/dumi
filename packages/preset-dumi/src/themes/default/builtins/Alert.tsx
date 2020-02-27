import React from 'react';
import './Alert.less';

export default ({ children, ...props }) => (
  <div className="__dumi-default-alert" {...props}>
    {children}
  </div>
);
