import React, { useState, useEffect, useContext } from 'react';
import type { IPreviewerComponentProps } from 'dumi/theme';
import { useDemoUrl } from 'dumi/theme';
import Layout from 'dumi-theme-default/src/layout';
import { context } from 'dumi/theme';
import type { IRouteComponentProps } from '@umijs/types';
import Device from '../components/Device';
import { ACTIVE_MSG_TYPE } from '../builtins/Previewer';
import '../style/layout.less';

const MobileLayout: React.FC<IRouteComponentProps> = ({ children, ...props }) => {
  const [demo, setDemo] = useState<IPreviewerComponentProps>(null);
  const builtinDemoUrl = useDemoUrl(demo?.identifier);
  const { meta: { mobile } } = useContext(context);

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

  const showMobileDevice = typeof mobile === 'boolean' ? mobile : true;

  return (
    <Layout {...props}>
      <div className="__dumi-default-mobile-content">
        <article>{children}</article>
        {demo && (
          <Device
            className={`__dumi-default-mobile-content-device ${!showMobileDevice ? 'hidden' : ''}`}
            url={demo.demoUrl || builtinDemoUrl}
          />
        )}
      </div>
    </Layout>
  );
};

export default MobileLayout;
