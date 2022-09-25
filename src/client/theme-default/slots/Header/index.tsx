import Logo from 'dumi/theme/slots/Logo';
import Navbar from 'dumi/theme/slots/Navbar';
import SearchBar from 'dumi/theme/slots/SearchBar';
import React, { type FC } from 'react';

const Header: FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid #eee',
        padding: '22px 0',
      }}
    >
      <Logo />
      &nbsp;Header Area&nbsp;
      <Navbar />
      <SearchBar />
    </div>
  );
};

export default Header;
