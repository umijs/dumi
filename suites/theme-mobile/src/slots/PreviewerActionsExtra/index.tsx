import { ReactComponent as IconQrcode } from '@ant-design/icons-svg/inline-svg/outlined/qrcode.svg';
import type { IPreviewerProps } from 'dumi';
import QRCode from 'qrcode.react';
import React, { type FC } from 'react';
import './index.less';

const PreviewerActionsExtra: FC<IPreviewerProps> = (props) => {
  const qrcodeUrl = `${location.origin}${props.demoUrl}`;
  return (
    <>
      {props.demoUrl && (
        <button
          className="dumi-default-previewer-action-btn dumi-mobile-previewer-action-qrcode"
          type="button"
          title={qrcodeUrl}
        >
          <IconQrcode />
          <QRCode value={qrcodeUrl} size={96} />
        </button>
      )}
    </>
  );
};

export default PreviewerActionsExtra;
