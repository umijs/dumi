import { useOutlet, useSiteData } from 'dumi';
import React, { useEffect, useRef } from 'react';
// @ts-ignore
import TouchEmulator from 'f2-touchemulator';
// @ts-ignore
import vl from 'umi-hd';
// @ts-ignore
import flex from 'umi-hd/lib/flex';
// @ts-ignore
import vw from 'umi-hd/lib/vw';
// @ts-ignore
import vh from 'umi-hd/lib/vh';

export const ROUTE_MSG_TYPE = 'dumi:update-iframe-route';

// available HD modes
const HD_MODES: any = {
  vl,
  flex,
  vw,
  vh,
};

const isSupportTouch = 'ontouchstart' in window;

const MobileDemoLayout: React.FC = ({}) => {
  const target = useRef<HTMLDivElement>(null);
  const {
    themeConfig: { hd: { rules = [] } = {} },
  } = useSiteData();
  const outlet = useOutlet();
  useEffect(() => {
    // Simulate the touch event of mobile terminal
    if (target.current && !isSupportTouch) {
      // fix https://github.com/umijs/dumi/issues/996
      TouchEmulator(document);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const { clientWidth } = document.documentElement;

      rules
        // discard invalid rules
        .filter((rule: any) => HD_MODES[rule.mode])
        // match first valid rule
        .some((rule: any) => {
          if (
            // without min & max width
            (Number.isNaN(rule.minWidth * 1) &&
              Number.isNaN(rule.maxWidth * 1)) ||
            // min width only
            (Number.isNaN(rule.maxWidth * 1) && clientWidth > rule.minWidth) ||
            // max width only
            (Number.isNaN(rule.minWidth * 1) && clientWidth < rule.maxWidth) ||
            // both min & max width
            (clientWidth > rule.minWidth && clientWidth < rule.maxWidth)
          ) {
            HD_MODES[rule.mode](...[].concat(rule.options));
            document.documentElement.setAttribute('data-scale', 'true');
          }
          return true;
        });
    };

    handler();
    window.addEventListener('resize', handler);

    return () => window.removeEventListener('resize', handler);
  }, [rules]);

  return (
    <div className="dumi-mobile-demo-layout" ref={target}>
      {outlet}
    </div>
  );
};

export default MobileDemoLayout;
