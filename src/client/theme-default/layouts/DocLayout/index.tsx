import { useOutlet } from 'dumi';
import { useIntl, useMatchedRouteMeta } from 'dumi/theme';
import Content from 'dumi/theme/slots/Content';
import Header from 'dumi/theme/slots/Header';
import Sidebar from 'dumi/theme/slots/Sidebar';
import React, { type FC } from 'react';
import Helmet from 'react-helmet';

const DocLayout: FC = () => {
  const intl = useIntl();
  const outlet = useOutlet();
  const meta = useMatchedRouteMeta();

  return (
    <div>
      <Helmet>
        <html lang={intl.locale.replace(/-.+$/, '')} />
        {meta.title && <title>{meta.title}</title>}
        {meta.title && <meta property="og:title" content={meta.title} />}
        {meta.description && (
          <meta name="description" content={meta.description} />
        )}
        {meta.description && (
          <meta property="og:description" content={meta.description} />
        )}
        {meta.keywords && (
          <meta name="keywords" content={meta.keywords.join(',')} />
        )}
        {meta.keywords && (
          <meta property="og:keywords" content={meta.keywords.join(',')} />
        )}
      </Helmet>
      <Header />
      <main style={{ display: 'flex' }}>
        <Sidebar />
        <Content>{outlet}</Content>
      </main>
    </div>
  );
};

export default DocLayout;
