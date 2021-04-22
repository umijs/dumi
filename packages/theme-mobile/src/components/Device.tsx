import type { FC} from 'react';
import React, { useState, useContext, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { context, usePrefersColor } from 'dumi/theme';
import './Device.less';

interface IDeviceProps {
  className?: string;
  url: string;
}

const Device: FC<IDeviceProps> = ({ url, className }) => {
  const [renderKey, setRenderKey] = useState(Math.random());
  const [dateTime, setDateTime] = useState(new Date());
  const [color] = usePrefersColor();
  const {
    config: { mode },
  } = useContext(context);

  // re-render iframe if prefers color changed
  useEffect(() => {
    setRenderKey(Math.random());
  }, [color]);
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date())
    }, 60000);
    return () => {
      clearInterval(timer);
    }
  }, [])

  return (
    <div
      className={['__dumi-default-device'].concat(className).join(' ')}
      data-device-type="iOS"
      data-mode={mode}
    >
      <div className="__dumi-default-device-status">
        <span>dumi</span>
        <span>{`${dateTime.getHours()}:${dateTime.getMinutes()}`}</span>
      </div>
      <iframe title="dumi-previewer" src={url} key={renderKey} />
      <div className="__dumi-default-device-action">
        <button
          className="__dumi-default-icon"
          role="refresh"
          onClick={() => setRenderKey(Math.random())}
        />
        <button className="__dumi-default-icon" role="qrcode">
          <QRCode value={url} size={96} />
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="__dumi-default-icon"
          role="open-demo"
        />
      </div>
    </div>
  );
};

export default Device;
