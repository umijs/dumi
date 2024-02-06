import RcTooltip from 'rc-tooltip';
import type { TooltipProps as RcTooltipProps } from 'rc-tooltip/lib/Tooltip';
import type { FC } from 'react';
import React from 'react';
import './index.less';

export interface TooltipProps extends Omit<RcTooltipProps, 'overlay'> {
  placement?: 'top' | 'bottom';
  title?: React.ReactNode;
}

const Tooltip: FC<TooltipProps> = (props) => {
  const { title, placement = 'top', ...rest } = props;
  return (
    <RcTooltip
      prefixCls="dumi-theme-default-tooltip"
      placement={placement}
      {...rest}
      overlay={title}
    />
  );
};

export default Tooltip;
