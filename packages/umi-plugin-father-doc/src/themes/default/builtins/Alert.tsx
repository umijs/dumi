import React from 'react';
import './Alert.less';

export default ({ children, ...props }) => (
  <div className="__father-doc-default-alert" {...props}>
    {children}
  </div>
);
