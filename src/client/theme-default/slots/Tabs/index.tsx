import InternalTabs, { type TabsProps as InternalTabsProps } from 'rc-tabs';
import React, { type FC } from 'react';
import './index.less';

export type ITabsProps = Omit<InternalTabsProps, 'prefixCls'>;

const Tabs: FC<ITabsProps> = (props) => (
  <InternalTabs prefixCls="dumi-default-tabs" moreIcon="···" {...props} />
);

export default Tabs;
