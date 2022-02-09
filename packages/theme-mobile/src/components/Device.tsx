import React, { useState, useContext, useEffect, useRef } from 'react';
import QRCode from 'qrcode.react';
import { context, usePrefersColor } from 'dumi/theme';
import { ROUTE_MSG_TYPE } from '../layouts/demo';
import './Device.less';
import type { FC } from 'react';

interface IDeviceProps {
  className?: string;
  url: string;
}

const Device: FC<IDeviceProps> = ({ url, className }) => {
  const iframeRef = useRef<HTMLIFrameElement>();
  const [iframeSrc, setIframeSrc] = useState<string>();
  const [renderKey, setRenderKey] = useState(Math.random());
  const [color] = usePrefersColor();
  const {
    config: { mode, theme },
  } = useContext(context);
  const carrier = theme?.carrier || 'dumi';

  // re-render iframe if prefers color changed
  useEffect(() => {
    setRenderKey(Math.random());
  }, [color]);

  // control iframe page update
  useEffect(() => {
    const { origin } = window.location;

    if (!iframeSrc || !url?.startsWith(origin)) {
      // set iframe src directly if it is the first render or custom url
      setIframeSrc(url);
    } else {
      const pathname = url
        // discard origin prefix
        .replace(origin, '')
        // discard router base
        .replace(`${(window as any)?.routerBase || ''}`.replace(/\/$/, ''), '');

      // update iframe page route via postmessage, to avoid page refresh
      iframeRef.current?.contentWindow.postMessage({ type: ROUTE_MSG_TYPE, value: pathname }, '*');
    }
  }, [url]);

  return (
    <div
      className={['__dumi-default-device'].concat(className).join(' ')}
      // avoid device flicker when using custom compiletime to render simulator
      data-device-type={iframeSrc ? 'iOS' : 'none'}
      data-mode={mode}
    >
      <div className="__dumi-default-device-status">
        <span className="__dumi-default-device-status-carrier">{carrier}</span>
        <span>10:24</span>
      </div>
      <iframe ref={iframeRef} title="dumi-previewer" src={iframeSrc} key={renderKey} />
      <div className="__dumi-default-device-action">
        <button
          className="__dumi-default-icon"
          role="refresh"
          onClick={() => setRenderKey(Math.random())}
        />
        <button className="__dumi-default-icon" role="qrcode">
          {url && <QRCode value={url} size={96} />}
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
