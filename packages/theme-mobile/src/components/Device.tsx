import React, { FC, useState, useContext } from 'react';
import QRCode from 'qrcode.react';
import { Link, context } from 'dumi/theme';
import './Device.less';

interface IDeviceProps {
  className?: string;
  url: string;
}

const Device: FC<IDeviceProps> = ({ url, className }) => {
  const [renderKey, setRenderKey] = useState(Math.random());
  const {
    config: { mode },
  } = useContext(context);

  return (
    <div
      className={['__dumi-default-device'].concat(className).join(' ')}
      data-device-type="iOS"
      data-mode={mode}
    >
      <div className="__dumi-default-device-status">
        <span>dumi</span>
        <span>10:24</span>
      </div>
      <iframe title="dumi-previewer" src={url} key={renderKey} />
      <div className="__dumi-default-device-action">
        <button
          className="__dumi-default-icon"
          role="refresh"
          onClick={() => setRenderKey(Math.random())}
        />
        <button className="__dumi-default-icon" role="qrcode">
          <QRCode value={`${window.document.location.origin}${url}`} size={96} />
        </button>
        <Link to={url} target="_blank" className="__dumi-default-icon" role="open-demo" />
      </div>
    </div>
  );
};

export default Device;
