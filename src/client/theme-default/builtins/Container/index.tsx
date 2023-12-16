import { ReactComponent as IconSuccess } from '@ant-design/icons-svg/inline-svg/outlined/check-circle.svg';
import { ReactComponent as IconError } from '@ant-design/icons-svg/inline-svg/outlined/close-circle.svg';
import { ReactComponent as IconInfo } from '@ant-design/icons-svg/inline-svg/outlined/info-circle.svg';
import { ReactComponent as IconWarning } from '@ant-design/icons-svg/inline-svg/outlined/warning.svg';
import * as React from 'react';
import './index.less';

const ICONS = {
  info: IconInfo,
  warning: IconWarning,
  success: IconSuccess,
  error: IconError,
} as const;

type ContainerProps = React.PropsWithChildren<{
  type: keyof typeof ICONS;
  title?: string;
}>;

const Container = (props: ContainerProps) => {
  const [Icon] = React.useState(() => ICONS[props.type]);

  return (
    <div className="dumi-default-container markdown" data-type={props.type}>
      <Icon />
      <h4>{props.title || props.type.toUpperCase()}</h4>
      <section>{props.children}</section>
    </div>
  );
};

export default Container;
