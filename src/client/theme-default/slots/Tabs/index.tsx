import InternalTabs, { type TabsProps as InternalTabsProps } from 'rc-tabs';
import React, { type FC } from 'react';
import './index.less';

export type TabsProps = Omit<InternalTabsProps, 'prefixCls'>;

const Tabs: FC<TabsProps> = (props) => (
  <InternalTabs prefixCls="dumi-default-tabs" moreIcon="···" {...props} />
);

export default Tabs;
