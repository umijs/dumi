import type { IPreviewerProps } from 'dumi';
import { useSiteData } from 'dumi';
import type { FC } from 'react';
import React from 'react';
import './index.less';

interface IDeviceProps {
  url: string;
  iframe: IPreviewerProps['iframe'];
}

const Device: FC<IDeviceProps> = (props) => {
  const {
    themeConfig: { deviceWidth },
  } = useSiteData();

  let inlineHeight = undefined;
  if (typeof props.iframe === 'number') inlineHeight = props.iframe;
  else if (typeof props.iframe === 'object' && props.iframe.height)
    inlineHeight = props.iframe.height;

  const iframeProps = typeof props.iframe === 'object' ? props.iframe : {};

  return (
    <div
      className="dumi-mobile-device"
      style={{
        width: deviceWidth,
        paddingTop: inlineHeight,
      }}
    >
      <iframe title="dumi-previewer" {...iframeProps} src={props.url} />
    </div>
  );
};

export default Device;
