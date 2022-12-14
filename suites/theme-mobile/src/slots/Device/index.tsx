import { useSiteData } from 'dumi';
import type { FC } from 'react';
import React from 'react';
import './index.less';

interface IDeviceProps {
  url: string;
  inlineHeight?: number;
}

const Device: FC<IDeviceProps> = (props) => {
  const {
    themeConfig: { deviceWidth },
  } = useSiteData();

  return (
    <div
      className="dumi-mobile-device"
      style={{
        width: deviceWidth,
        paddingTop: props.inlineHeight,
      }}
    >
      <iframe title="dumi-previewer" src={props.url} />
    </div>
  );
};

export default Device;
