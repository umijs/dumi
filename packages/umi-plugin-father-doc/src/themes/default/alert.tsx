// Todo: fix definition files cannot be identified problem
/// <reference path="../typings/typings.d.ts" />
import './alert.less';

export default ({ children, ...props }) => (
  <div
    className="__father-doc-default-alert"
    {...props}
  >
    {children}
  </div>
);
