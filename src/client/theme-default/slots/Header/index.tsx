import { useRouteMeta } from 'dumi';
import LangSwitch from 'dumi/theme/slots/LangSwitch';
import Logo from 'dumi/theme/slots/Logo';
import Navbar from 'dumi/theme/slots/Navbar';
import SearchBar from 'dumi/theme/slots/SearchBar';
import React, { type FC } from 'react';
import './index.less';

const Header: FC = () => {
  const { frontmatter } = useRouteMeta();

  return (
    <div
      className="dumi-default-header"
      data-static={Boolean(frontmatter.hero) || undefined}
    >
      <div className="dumi-default-header-content">
        <section className="dumi-default-header-left">
          <Logo />
        </section>
        <section className="dumi-default-header-right">
          <Navbar />
          <div className="dumi-default-header-right-aside">
            <SearchBar />
            <LangSwitch />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Header;
