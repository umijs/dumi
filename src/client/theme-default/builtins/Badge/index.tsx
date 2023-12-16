import * as React from 'react';
import './index.less';

type BadgeProps = React.PropsWithChildren<{
  type: 'info' | 'warning' | 'error' | 'success';
}>;

const Badge = (props: BadgeProps) => (
  <span className="dumi-default-badge" {...props} />
);

export default Badge;
