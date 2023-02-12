import { IPreviewerProps, useRouteMeta, useSiteData } from 'dumi';
import Previewer from 'dumi/theme-default/builtins/Previewer';
import Device from 'dumi/theme/slots/Device';
import React, { useCallback, useEffect, useState, type FC } from 'react';
import './index.less';

const MobilePreviewer: FC<IPreviewerProps> = (props) => {
  const {
    frontmatter: { mobile = true },
  } = useRouteMeta();
  const { themeConfig } = useSiteData();
  const generateUrl = useCallback((p: typeof props) => {
    const [pathname, search] = p.demoUrl.split('?');
    const params = new URLSearchParams(search);

    if (p.compact) params.set('compact', '');
    if (p.background) params.set('background', p.background);

    return `${pathname}?${params.toString()}`.replace(/\?$/, '');
  }, []);
  const [demoUrl, setDemoUrl] = useState(() => generateUrl(props));

  useEffect(() => {
    setDemoUrl(generateUrl(props));
  }, [props.compact, props.background]);

  return (
    <Previewer
      {...props}
      demoUrl={demoUrl}
      iframe={mobile ? false : props?.iframe}
      className={mobile ? 'dumi-mobile-previewer' : undefined}
      forceShowCode={mobile}
      style={{
        '--device-width': themeConfig.deviceWidth
          ? `${themeConfig.deviceWidth}px`
          : undefined,
      }}
    >
      {mobile && (
        <Device
          url={demoUrl}
          inlineHeight={
            typeof props.iframe === 'number' ? props.iframe : undefined
          }
        />
      )}
      {!mobile && props?.children}
    </Previewer>
  );
};

export default MobilePreviewer;
