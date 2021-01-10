import React, { useState, useEffect } from 'react';
import { useDemoUrl } from 'dumi/theme';
import Layout from 'dumi-theme-default/src/layout';
import type { IRouteComponentProps } from '@umijs/types';
import Device from '../components/Device';
import { ACTIVE_MSG_TYPE } from '../builtins/Previewer';
import '../style/layout.less';

const MobileLayout: React.FC<IRouteComponentProps> = ({ children, ...props }) => {
  const [demoId, setDemoId] = useState('');
  const demoUrl = useDemoUrl(demoId);

  useEffect(() => {
    const handler = (ev: any) => {
      if (ev.data.type === ACTIVE_MSG_TYPE) {
        setDemoId(ev.data.value);
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, []);

  // clear demoId when route changed
  useEffect(() => {
    setDemoId('');
  }, [props.location.pathname]);

  return (
    <Layout {...props}>
      <div className="__dumi-default-mobile-content">
        <article>{children}</article>
        {demoId && <Device className="__dumi-default-mobile-content-device" url={demoUrl} />}
      </div>
    </Layout>
  );
};

export default MobileLayout;
