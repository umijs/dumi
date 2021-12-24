import React, { useState, useEffect, useContext } from 'react';
import type { IPreviewerComponentProps } from 'dumi/theme';
import { context, useDemoUrl } from 'dumi/theme';
import Layout from 'dumi-theme-default/es/layout';
import type { IRouteComponentProps } from '@umijs/types';
import Device from '../components/Device';
import { ACTIVE_MSG_TYPE } from '../builtins/Previewer';
import '../style/layout.less';

const MobileLayout: React.FC<IRouteComponentProps> = ({ children, ...props }) => {
  const {
    config: { mode },
    demos,
    meta,
  } = useContext(context);
  const [demo, setDemo] = useState<IPreviewerComponentProps>(null);
  const builtinDemoUrl = useDemoUrl(demo?.identifier);
  const hasMobilePreviewer = meta.hasPreviewer && meta.mobile !== false;

  useEffect(() => {
    const handler = (ev: any) => {
      if (ev.data.type === ACTIVE_MSG_TYPE) {
        setDemo(JSON.parse(ev.data.value));
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, []);

  // clear demoId when route changed
  useEffect(() => {
    setDemo(null);
  }, [props.location.pathname]);

  // render toc to side menu by default
  if (hasMobilePreviewer && meta.toc !== false && meta.toc === undefined) {
    meta.toc = 'menu';
  }

  return (
    <Layout {...props}>
      <div className="__dumi-default-mobile-content">
        <article>{children}</article>
        {hasMobilePreviewer && demo?.simulator !== false && (
          // render via builtin device simulator
          <Device
            className="__dumi-default-mobile-content-device"
            url={demo?.demoUrl || builtinDemoUrl}
          />
        )}
        {demo?.simulator === false && (
          // render demo directly (for custom compiletime)
          <div className="__dumi-default-device" data-mode={mode}>
            {React.createElement(demos[demo.identifier].component)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MobileLayout;
