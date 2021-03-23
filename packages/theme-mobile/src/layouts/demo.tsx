import React, { useEffect, useContext } from 'react';
import type { IRouteComponentProps } from '@umijs/types';
import { context } from 'dumi/theme';
import TouchEmulator from 'f2-touchemulator';
import vl from 'umi-hd';
import flex from 'umi-hd/lib/flex';
import vw from 'umi-hd/lib/vw';
import vh from 'umi-hd/lib/vh';
import type IThemeConfig from '../typings/config';

// available HD modes
const HD_MODES = {
  vl,
  flex,
  vw,
  vh,
};

const MobileDemoLayout: React.FC<IRouteComponentProps> = ({ children }) => {
  const { config } = useContext(context);
  const {
    hd: { rules = [{ mode: 'vw', options: [100, 750] }] } = {},
  } = config.theme as IThemeConfig;

  useEffect(() => {
    const handler = () => {
      const { clientWidth } = document.documentElement;
      // Simulate the touch event of mobile terminal
      const target = document.getElementsByClassName('__dumi-default-mobile-demo-layout');
      if (target && target[0]) {
        TouchEmulator(target[0]);
      } else {
        TouchEmulator(window);
      }
      rules
        // discard invalid rules
        .filter(rule => HD_MODES[rule.mode])
        // match first valid rule
        .some(rule => {
          if (
            // without min & max width
            (Number.isNaN(rule.minWidth * 1) && Number.isNaN(rule.maxWidth * 1)) ||
            // min width only
            (Number.isNaN(rule.maxWidth * 1) && clientWidth > rule.minWidth) ||
            // max width only
            (Number.isNaN(rule.minWidth * 1) && clientWidth < rule.maxWidth) ||
            // both min & max width
            (clientWidth > rule.minWidth && clientWidth < rule.maxWidth)
          ) {
            HD_MODES[rule.mode](...[].concat(rule.options));
            document.documentElement.setAttribute('data-scale', 'true');
            return true;
          }
        });
    };

    handler();
    window.addEventListener('resize', handler);

    return () => window.removeEventListener('resize', handler);
  }, [rules]);

  return <div className="__dumi-default-mobile-demo-layout">{children}</div>;
};

export default MobileDemoLayout;
