import React from 'react';
import './alert.less';

export default ({ children, ...props }) => (
  <div className="__father-doc-default-alert" {...props}>
    {children}
  </div>
);
