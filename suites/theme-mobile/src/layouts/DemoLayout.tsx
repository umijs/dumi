import { useOutlet, useSearchParams, useSiteData } from 'dumi';
import TouchEmulator from 'f2-touchemulator';
import React, { useEffect, useRef } from 'react';
import vl from 'umi-hd';
import flex from 'umi-hd/lib/flex';
import vh from 'umi-hd/lib/vh';
import vw from 'umi-hd/lib/vw';
import './DemoLayout.less';

export const ROUTE_MSG_TYPE = 'dumi:update-iframe-route';

// available HD modes
const HD_MODES: any = {
  vl,
  flex,
  vw,
  vh,
};

const MobileDemoLayout: React.FC = ({}) => {
  const target = useRef<HTMLDivElement>(null);
  const {
    themeConfig: { hd: { rules = [{ mode: 'vw', options: [100, 750] }] } = {} },
  } = useSiteData();
  const outlet = useOutlet();
  const [params] = useSearchParams();
  const compact = params.get('compact');
  const background = params.get('background');

  useEffect(() => {
    // Simulate the touch event of mobile terminal
    if (target.current && !('ontouchstart' in window)) {
      // fix https://github.com/umijs/dumi/issues/996
      TouchEmulator(document.documentElement);
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
    <div
      className="dumi-mobile-demo-layout"
      ref={target}
      style={{
        padding: compact !== null ? 0 : compact,
        background,
      }}
      data-html2sketch-container
    >
      {outlet}
    </div>
  );
};

export default MobileDemoLayout;
