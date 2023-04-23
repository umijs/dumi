import { useSiteData } from 'dumi';
import React, { useEffect, useState, type FC } from 'react';
import './index.less';

const IconRtl = () => (
  <svg viewBox="0 0 14 16">
    <path d="M5.003 6.39v3.594c0 .4.275.674.674.674.4 0 .674-.274.674-.674V1.323h1.997v8.661c0 .4.274.674.674.674s.674-.274.674-.674V1.323h3.295c.399 0 .674-.275.674-.674 0-.4-.275-.649-.674-.649H4.928C3.131 0 1.733 1.398 1.733 3.195S3.206 6.39 5.003 6.39Zm0-5.067v3.72c-1.073 0-1.922-.8-1.922-1.873s.799-1.847 1.922-1.847Zm7.988 11.332H2.73l.8-.674c.274-.2.324-.674.124-.923-.2-.275-.674-.325-.923-.125L.735 12.53c-.275.275-.4.525-.4.874 0 .325.125.674.4.874l1.997 1.597a.829.829 0 0 0 .4.125c.199 0 .398-.075.523-.275.2-.274.2-.723-.125-.923l-.998-.799h10.459c.399 0 .674-.274.674-.674 0-.424-.275-.674-.674-.674Z" />
  </svg>
);

const IconLtr = () => (
  <svg viewBox="0 0 14 16">
    <path d="M5.003 6.39v3.594c0 .4.275.674.674.674.4 0 .674-.274.674-.674V1.323h1.997v8.661c0 .4.274.674.674.674s.674-.274.674-.674V1.323h3.295c.399 0 .674-.275.674-.674 0-.4-.275-.649-.674-.649H4.928C3.131 0 1.733 1.398 1.733 3.195S3.206 6.39 5.003 6.39Zm0-5.067v3.72c-1.073 0-1.922-.8-1.922-1.873s.799-1.847 1.922-1.847ZM1.01 12.655h10.26l-.8-.674c-.274-.2-.324-.674-.124-.923.2-.275.674-.325.923-.125l1.997 1.597c.275.275.4.525.4.874 0 .325-.125.674-.4.874l-1.997 1.597a.829.829 0 0 1-.399.125.59.59 0 0 1-.524-.275c-.2-.274-.2-.723.125-.923l.998-.799H1.009c-.399 0-.674-.274-.674-.674 0-.424.275-.674.674-.674Z" />
  </svg>
);

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
    <button
      type="button"
      className="dumi-default-rtl-switch"
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
      data-dumi-tooltip={rtl ? 'RTL' : 'LTR'}
      data-dumi-tooltip-bottom
    >
      {rtl ? <IconRtl /> : <IconLtr />}
    </button>
  );
};

export default RtlSwitch;
