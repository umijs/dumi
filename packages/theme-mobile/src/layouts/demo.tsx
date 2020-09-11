import React, { useEffect } from 'react';
import { IRouteComponentProps } from '@umijs/types';
import vw from 'umi-hd/lib/vw';
import flex from 'umi-hd/lib/flex';

const MobileDemoLayout: React.FC<IRouteComponentProps> = ({ children }) => {
  useEffect(() => {
    const handler = () => {
      if (document.documentElement.clientWidth >= 750) {
        vw(100, 750);
      } else {
        flex(100, 1);
      }

      // hd solution for antd-mobile@2
      // ref: https://mobile.ant.design/docs/react/upgrade-notes-cn#%E9%AB%98%E6%B8%85%E6%96%B9%E6%A1%88
      // @ts-ignore
      document.documentElement.setAttribute('data-scale', true);
    };

    handler();

    window.addEventListener('resize', handler);

    return () => window.removeEventListener('resize', handler);
  }, []);

  return <div className="__dumi-default-mobile-demo-layout">{children}</div>;
};

export default MobileDemoLayout;
