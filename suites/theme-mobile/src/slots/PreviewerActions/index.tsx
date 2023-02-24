import PreviewerActions from 'dumi/theme-default/slots/PreviewerActions';
import React from 'react';

const MobilePreviewerActions: typeof PreviewerActions = (props) => (
  <PreviewerActions
    {...props}
    demoContainer={
      props.iframe === false
        ? // use mobile device iframe as demo container when original iframe is false
          (props.demoContainer?.querySelector('iframe') as HTMLIFrameElement)
        : props.demoContainer
    }
  />
);

export default MobilePreviewerActions;
