import type { FC } from 'react';
import React from 'react';
import './index.less';

interface IDeviceProps {
  url: string;
}

const Device: FC<IDeviceProps> = ({ url }) => {
  return (
    <div className="dumi-default-mobile-device" data-device-type="iOS">
      <iframe title="dumi-previewer" src={url} />
    </div>
  );
};

export default Device;
