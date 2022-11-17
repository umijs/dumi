import { useSiteData } from 'dumi';
import React, { useEffect, useState, type FC } from 'react';
import './index.less';

const LS_RTL_KEY = 'dumi:rtl';

const RtlSwitch: FC = () => {
  const [rtl, setRtl] = useState(false);
  const { themeConfig } = useSiteData();

  useEffect(() => {
    if (localStorage.getItem(LS_RTL_KEY)) {
      setRtl(true);
      document.documentElement.setAttribute('data-direction', 'rtl');
    }
  }, []);

  if (!themeConfig.rtl) return null;

  return (
    <span
      className="dumi-default-lang-switch"
      onClick={() => {
        if (rtl) {
          document.documentElement.removeAttribute('data-direction');
          localStorage.removeItem(LS_RTL_KEY);
        } else {
          document.documentElement.setAttribute('data-direction', 'rtl');
          localStorage.setItem(LS_RTL_KEY, '1');
        }
        setRtl(!rtl);
      }}
    >
      {rtl ? 'LTR' : 'RTL'}
    </span>
  );
};

export default RtlSwitch;
