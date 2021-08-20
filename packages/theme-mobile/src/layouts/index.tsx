import React, { useState, useEffect, useContext } from 'react';
import type { IPreviewerComponentProps } from 'dumi/theme';
import { context, useDemoUrl } from 'dumi/theme';
import Layout from 'dumi-theme-default/es/layout';
import type { IRouteComponentProps } from '@umijs/types';
// @ts-ignore
import demos from '@@/dumi/demos';
import Device from '../components/Device';
import { ACTIVE_MSG_TYPE } from '../builtins/Previewer';
import '../style/layout.less';

const MobileLayout: React.FC<IRouteComponentProps> = ({ children, ...props }) => {
  const {
    config: { mode },
  } = useContext(context);
  const [demo, setDemo] = useState<IPreviewerComponentProps>(null);
  const builtinDemoUrl = useDemoUrl(demo?.identifier);

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

  return (
    <Layout {...props}>
      <div className="__dumi-default-mobile-content">
        <article>{children}</article>
        {demo &&
          (demo.simulator !== false ? (
            <Device
              className="__dumi-default-mobile-content-device"
              url={demo.demoUrl || builtinDemoUrl}
            />
          ) : (
            <div className="__dumi-default-device" data-mode={mode}>
              {React.createElement(demos[demo.identifier].component)}
            </div>
          ))}
      </div>
    </Layout>
  );
};

export default MobileLayout;
