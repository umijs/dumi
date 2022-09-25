import { useOutlet } from 'dumi';
import Content from 'dumi/theme/slots/Content';
import Header from 'dumi/theme/slots/Header';
import Sidebar from 'dumi/theme/slots/Sidebar';
import React, { type FC } from 'react';

const DocLayout: FC = () => {
  const outlet = useOutlet();

  return (
    <div>
      <Header />
      <main style={{ display: 'flex' }}>
        <Sidebar />
        <Content>{outlet}</Content>
      </main>
    </div>
  );
};

export default DocLayout;
