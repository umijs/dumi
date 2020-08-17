import React, { FC } from 'react';
import './Device.less';

interface DeviceProps {
  url: string;
}

const Device: FC<DeviceProps> = ({ url }) => {
  return (
    <div className="__dumi-default-device ios">
      <figure>
        <svg className="__dumi-default-device__md-bar" viewBox="0 0 1384.3 40.3">
          <path
            className="st0"
            d="M1343 5l18.8 32.3c.8 1.3 2.7 1.3 3.5 0L1384 5c.8-1.3-.2-3-1.7-3h-37.6c-1.5 0-2.5 1.7-1.7 3z"
          />
          <circle className="st0" cx="1299" cy="20.2" r="20" />
          <path
            className="st0"
            d="M1213 1.2h30c2.2 0 4 1.8 4 4v30c0 2.2-1.8 4-4 4h-30c-2.2 0-4-1.8-4-4v-30c0-2.3 1.8-4 4-4zM16 4.2h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H16c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
          />
        </svg>
        <iframe title="dumi mobile" src={url} onLoad={(event) => {
          const { target } = event as any;
          const currentDoc = target?.contentDocument || target?.contentWindow.document
          // 根据当前设定的窗口大小，设置 iframe 的 fontsize
          currentDoc.querySelector('html').style.fontSize = '100px'
        }} />
      </figure>
    </div>
  );
};

export default Device;
