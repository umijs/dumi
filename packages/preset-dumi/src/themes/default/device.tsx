/* eslint-disable react/jsx-no-target-blank */
import React, { useState, FC } from 'react';
import Popover from 'antd/es/popover';
// @ts-ignore
import QRCode from 'qrcode.react';
import 'antd/es/popover/style/index';
import './device.less';

// 先用qrcode.react，担心大小太大了，可能的话，自己实现
// https://github.com/davidshimjs/qrcodejs
interface DeviceProps {
  url: string;
  source: string;
  isCN?: any;
}
interface DeviceLocale {
  view_source: string;
}
const getLocale = (isCN: string) => {
  const locales: { [key: string]: DeviceLocale } = {
    'zh-cn': {
      view_source: '查看源码',
    },
    en: {
      view_source: 'View Source',
    },
  };
  // 把key转成全小写的
  return locales[isCN ? 'zh-cn' : 'en'];
};
const Device: FC<DeviceProps> = ({ url, source, isCN = true }) => {
  const locale = getLocale(isCN);
  const content = <QRCode value={url} size={258} />;
  return (
    <>
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
          <iframe title="dumi mobile" src={url} />
        </figure>
        <a href={source} className="__dumi-default-source" target="_blank" title="Demo Source">
          <Popover content={content} trigger="hover">
            <QRCode value={url} size={24} style={{ marginRight: '5px' }} />
          </Popover>
          {locale.view_source}
        </a>
      </div>
    </>
  );
};

export default Device;
