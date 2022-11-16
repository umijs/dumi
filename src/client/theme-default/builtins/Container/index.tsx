import { ReactComponent as IconSuccess } from '@ant-design/icons-svg/inline-svg/outlined/check-circle.svg';
import { ReactComponent as IconError } from '@ant-design/icons-svg/inline-svg/outlined/close-circle.svg';
import { ReactComponent as IconInfo } from '@ant-design/icons-svg/inline-svg/outlined/info-circle.svg';
import { ReactComponent as IconWarning } from '@ant-design/icons-svg/inline-svg/outlined/warning.svg';
import React, { useState, type FC, type ReactNode } from 'react';
import './index.less';

const ICONS = {
  info: IconInfo,
  warning: IconWarning,
  success: IconSuccess,
  error: IconError,
};

const Container: FC<{ type: string; title?: string; children: ReactNode }> = (
  props,
) => {
  const [Icon] = useState(() => ICONS[props.type as keyof typeof ICONS]);

  return (
    <div className="dumi-default-container markdown" data-type={props.type}>
      <Icon />
      <h4>{props.title || props.type.toUpperCase()}</h4>
      <section>{props.children}</section>
    </div>
  );
};

export default Container;
