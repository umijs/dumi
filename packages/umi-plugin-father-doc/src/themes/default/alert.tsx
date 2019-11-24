// Todo: fix definition files cannot be identified problem
/// <reference path="../typings/typings.d.ts" />
import styles from './alert.less';

export default ({ children, ...props }) => (
  <div
    className={styles.wrapper}
    {...props}
  >
    {children}
  </div>
);
