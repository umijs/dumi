import { ReactComponent as IconQrcode } from '@ant-design/icons-svg/inline-svg/outlined/qrcode.svg';
import { useRouteMeta } from 'dumi';
import PreviewerActions from 'dumi/theme-default/slots/PreviewerActions';
import QRCode from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import './index.less';

const MobilePreviewerActions: typeof PreviewerActions = (props) => {
  const {
    frontmatter: { mobile = true },
  } = useRouteMeta();
  const [qrcodeUrl, setQrcodeUrl] = useState('');
  const extra = (
    <>
      {mobile && props.demoUrl && (
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

  useEffect(() => {
    // for adapt ssr
    setQrcodeUrl(`${location.origin}${props.demoUrl}`);
  }, [props.demoUrl]);

  return (
    <PreviewerActions
      {...props}
      extra={extra}
      demoContainer={
        props.iframe === false
          ? // use mobile device iframe as demo container when original iframe is false
            (props.demoContainer?.querySelector('iframe') as HTMLIFrameElement)
          : props.demoContainer
      }
    />
  );
};

export default MobilePreviewerActions;
