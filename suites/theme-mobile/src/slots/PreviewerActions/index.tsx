import { ReactComponent as IconQrcode } from '@ant-design/icons-svg/inline-svg/outlined/qrcode.svg';
import { useRouteMeta } from 'dumi';
import PreviewerActions from 'dumi/theme-default/slots/PreviewerActions';
import QRCode from 'qrcode.react';
import React, {
  useEffect,
  useState,
  type ComponentProps,
  type FC,
} from 'react';
import './index.less';

type IPreviewerActionsProps = ComponentProps<typeof PreviewerActions> & {
  qrCodeUrl?: string;
};

const MobilePreviewerActions: FC<IPreviewerActionsProps> = (props) => {
  const {
    frontmatter: { mobile = true },
  } = useRouteMeta();
  const [qrCodeUrl, setQrCodeUrl] = useState(props.qrCodeUrl || '');
  const extra = (
    <>
      {mobile && props.demoUrl && (
        <button
          className="dumi-default-previewer-action-btn dumi-mobile-previewer-action-qrcode"
          type="button"
          title={qrCodeUrl}
        >
          <IconQrcode />
          <QRCode value={qrCodeUrl} size={96} />
        </button>
      )}
    </>
  );

  useEffect(() => {
    // for adapt ssr
    setQrCodeUrl(props.qrCodeUrl || `${location.origin}${props.demoUrl}`);
  }, [props.demoUrl, props.qrCodeUrl]);

  return (
    <PreviewerActions
      {...props}
      extra={
        <>
          {extra}
          {props.extra}
        </>
      }
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
