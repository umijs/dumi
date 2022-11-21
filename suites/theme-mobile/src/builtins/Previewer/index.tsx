import { IPreviewerProps, useRouteMeta } from 'dumi';
import Previewer from 'dumi/theme-default/builtins/Previewer';
import Device from 'dumi/theme/slots/Device';
import React, { type FC } from 'react';
import './index.less';

const MobilePreviewer: FC<IPreviewerProps> = (props) => {
  const {
    frontmatter: { mobile = true },
  } = useRouteMeta();

  return (
    <Previewer
      {...props}
      iframe={mobile ? false : props?.iframe}
      className={mobile ? 'dumi-default-mobile-previewer' : ''}
      hasShowCodeButton={mobile ? false : true}
    >
      {mobile && <Device url={props.demoUrl} />}
      {!mobile && props?.children}
    </Previewer>
  );
};

export default MobilePreviewer;
