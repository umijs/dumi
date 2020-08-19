import React, { useContext, useState, useEffect } from 'react';
import { IRouteComponentProps } from '@umijs/types';
import { context } from 'dumi/theme';
import Device from './components/Device';
import './style/layout.less';

const Content: React.FC<IRouteComponentProps> = ({ children, location }) => {
  const {
    config: { mode },
  } = useContext(context);
  const [previewId, setPreviewId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target)
        .forEach((event) => setPreviewId(event.id));
    }, {
      root: document.querySelector('docs-content'),
      rootMargin: '0px 0px -95% 0px',
      threshold: 0
    });
    const contentEl = document.getElementById('dumi-default-layout-content');
    const demos = Array.from(contentEl.querySelectorAll('.__dumi-default-previewer'));
    demos.forEach((i) => {
      if (i instanceof HTMLElement) {
        observer.observe(i);
      }
    });
    if (demos[0] && demos[0].id) {
      setPreviewId(demos[0].id)
    }
    return () => {
      observer.disconnect();
    }
  }, [location.pathname])
  const isSiteMode = mode === 'site';
  return (
    <div className="__dumi-default-layout-content" id="dumi-default-layout-content">
      <div className="__dumi-default-layout-col">
        <div className="__dumi-default-layout-article">{children}</div>
        <div className="__dumi-default-layout-device"
          data-site-mode={isSiteMode}
        >
          {previewId && <Device url={`/~demos/${previewId}`} isSiteMode={isSiteMode} />}
        </div>
      </div>
    </div>
  );
}
export default Content;
