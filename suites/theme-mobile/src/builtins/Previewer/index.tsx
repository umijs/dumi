import { IPreviewerProps, useRouteMeta, useSiteData } from 'dumi';
import Previewer from 'dumi/theme-default/builtins/Previewer';
import Device from 'dumi/theme/slots/Device';
import React, { type FC } from 'react';
import './index.less';

const MobilePreviewer: FC<IPreviewerProps> = (props) => {
  const {
    frontmatter: { mobile = true },
  } = useRouteMeta();
  const { themeConfig } = useSiteData();

  return (
    <Previewer
      {...props}
      iframe={!mobile ?? props?.iframe}
      className={mobile ? 'dumi-mobile-previewer' : undefined}
      forceShowCode={!mobile}
      style={{
        '--device-width': themeConfig.deviceWidth,
      }}
    >
      {mobile && <Device url={props.demoUrl} inlineHeight={props.iframe} />}
      {!mobile && props?.children}
    </Previewer>
  );
};

export default MobilePreviewer;
