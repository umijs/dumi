import React, { useContext, useState, useEffect } from 'react';
import { IRouteComponentProps } from '@umijs/types';
import { context, Link } from 'dumi/theme';
import Navbar from 'dumi-theme-default/es/components/Navbar';
import SideMenu from 'dumi-theme-default/es/components/SideMenu';
import SlugList from 'dumi-theme-default/es/components/SlugList';
import SearchBar from 'dumi-theme-default/es/components/SearchBar';
import Device from './components/Device';

import './style/layout.less';

const Hero = hero => (
  <>
    <div className="__dumi-default-layout-hero">
      <h1>{hero.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: hero.desc }} />
      {hero.actions &&
        hero.actions.map(action => (
          <Link to={action.link} key={action.text}>
            <button type="button">{action.text}</button>
          </Link>
        ))}
    </div>
  </>
);

const Features = features => (
  <div className="__dumi-default-layout-features">
    {features.map(feat => (
      <dl key={feat.title} style={{ backgroundImage: feat.icon ? `url(${feat.icon})` : undefined }}>
        <dt>{feat.title}</dt>
        <dd dangerouslySetInnerHTML={{ __html: feat.desc }} />
      </dl>
    ))}
  </div>
);

const Layout: React.FC<IRouteComponentProps> = ({ children, location }) => {
  const {
    config: { mode, locales, repository, navs },
    meta,
    locale,
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
  const { url: repoUrl, branch } = repository;
  const [menuCollapsed, setMenuCollapsed] = useState<boolean>(true);
  const isSiteMode = mode === 'site';
  const showHero = isSiteMode && meta.hero;
  const showFeatures = isSiteMode && meta.features;
  const showSideMenu = meta.sidemenu !== false && !showHero && !showFeatures && !meta.gapless;
  const showSlugs =
    !showHero &&
    !showFeatures &&
    Boolean(meta.slugs?.length) &&
    (meta.toc === 'content' || meta.toc === undefined) &&
    !meta.gapless && !previewId;
  const isCN =
    locale === 'zh-CN' ||
    (locale === '*' && locales[0]?.name === 'zh-CN') ||
    /[\u4e00-\u9fa5]/.test(JSON.stringify(navs));
  const updatedTime: any = new Date(meta.updatedTime).toLocaleString();
  const repoPlatform = { github: 'GitHub', gitlab: 'GitLab' }[
    (repoUrl || '').match(/(github|gitlab)/)?.[1] || 'nothing'
  ];

  return (
    <div
      className="__dumi-default-layout"
      data-show-sidemenu={String(showSideMenu)}
      data-show-slugs={String(showSlugs)}
      data-site-mode={isSiteMode}
      data-gapless={String(!!meta.gapless)}
      onClick={() => setMenuCollapsed(true)}
    >
      <Navbar
        navPrefix={<SearchBar />}
        onMobileMenuClick={ev => {
          setMenuCollapsed(val => !val);
          ev.stopPropagation();
        }}
      />
      <SideMenu mobileMenuCollapsed={menuCollapsed} location={location} />
      {showSlugs && <SlugList slugs={meta.slugs} className="__dumi-default-layout-toc" />}
      {showHero && Hero(meta.hero)}
      {showFeatures && Features(meta.features)}
      <div className="__dumi-default-layout-content" id="dumi-default-layout-content">
        <div className="__dumi-default-layout-col">
          <div className="__dumi-default-layout-article">{children}</div>
          <div className="__dumi-default-layout-device">
            {previewId && <Device url={`/~demos/${previewId}`} />}
          </div>
        </div>
        {!showHero && !showFeatures && meta.filePath && !meta.gapless && (
          <div className="__dumi-default-layout-footer-meta">
            {repoPlatform && (
              <Link to={`${repoUrl}/edit/${branch}/${meta.filePath}`}>
                {isCN ? `在 ${repoPlatform} 上编辑这篇文档` : `Edit this doc on ${repoPlatform}`}
              </Link>
            )}
            <span data-updated-text={isCN ? '最后更新时间：' : 'Last Update: '}>{updatedTime}</span>
          </div>
        )}
        {(showHero || showFeatures) && meta.footer && (
          <div
            className="__dumi-default-layout-footer"
            dangerouslySetInnerHTML={{ __html: meta.footer }}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
