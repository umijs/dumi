import { ReactComponent as IconSidebar } from '@ant-design/icons-svg/inline-svg/outlined/align-left.svg';
import { Helmet, useIntl, useOutlet, useRouteMeta, useSidebarData } from 'dumi';
import Content from 'dumi/theme/slots/Content';
import Features from 'dumi/theme/slots/Features';
import Footer from 'dumi/theme/slots/Footer';
import Header from 'dumi/theme/slots/Header';
import Hero from 'dumi/theme/slots/Hero';
import Sidebar from 'dumi/theme/slots/Sidebar';
import Toc from 'dumi/theme/slots/Toc';
import React, { useState, type FC } from 'react';
import './index.less';

const DocLayout: FC = () => {
  const intl = useIntl();
  const outlet = useOutlet();
  const sidebar = useSidebarData();
  const [showSidebar, setShowSidebar] = useState(false);
  const { frontmatter: fm } = useRouteMeta();

  return (
    <div
      className="dumi-default-doc-layout"
      data-mobile-sidebar-active={showSidebar || undefined}
      onClick={() => setShowSidebar(false)}
    >
      <Helmet>
        <html lang={intl.locale.replace(/-.+$/, '')} />
        {fm.title && <title>{fm.title}</title>}
        {fm.title && <meta property="og:title" content={fm.title} />}
        {fm.description && <meta name="description" content={fm.description} />}
        {fm.description && (
          <meta property="og:description" content={fm.description} />
        )}
        {fm.keywords && (
          <meta name="keywords" content={fm.keywords.join(',')} />
        )}
        {fm.keywords && (
          <meta property="og:keywords" content={fm.keywords.join(',')} />
        )}
      </Helmet>
      <Header />
      <Hero />
      <Features />
      {sidebar && (
        <div className="dumi-default-doc-layout-mobile-bar">
          <button
            type="button"
            className="dumi-default-sidebar-btn"
            onClick={(ev) => {
              ev.stopPropagation();
              setShowSidebar((v) => !v);
            }}
          >
            <IconSidebar />
            {intl.formatMessage({ id: 'layout.sidebar.btn' })}
          </button>
        </div>
      )}
      <main>
        <Sidebar />
        <Content>
          {outlet}
          <Footer />
        </Content>
        {fm.toc === 'content' && (
          <div className="dumi-default-doc-layout-toc-wrapper">
            <h4>TABLE OF CONTENTS</h4>
            <Toc />
          </div>
        )}
      </main>
    </div>
  );
};

export default DocLayout;
