import GalleryContent from 'dumi/theme/slots/GalleryContent';
import GalleryFooter from 'dumi/theme/slots/GalleryFooter';
import GalleryHeader from 'dumi/theme/slots/GalleryHeader';
import Content from '../components/Content';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Page from '../components/Page';

import { React } from 'react';

export default () => (
  <Page>
    <Header>
      <GalleryHeader />
    </Header>
    <Content>
      <GalleryContent />
    </Content>
    <Footer>
      <GalleryFooter />
    </Footer>
  </Page>
);
