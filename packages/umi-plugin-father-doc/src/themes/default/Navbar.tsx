import React, { useContext, FC, MouseEvent, ChangeEvent } from 'react';
import Link from 'umi/link';
import NavLink from 'umi/navlink';
import context from './context';
import './Navbar.less';

interface INavbarProps {
  onLocaleChange: (ev: ChangeEvent<HTMLSelectElement>) => void;
  onMobileMenuClick: (ev: MouseEvent<HTMLButtonElement>) => void;
}

const Navbar: FC<INavbarProps> = ({ onMobileMenuClick, onLocaleChange }) => {
  const { locale, rootPath, mode, title, logo, locales, navs } = useContext(context);

  return (
    <div className="__father-doc-default-navbar" data-mode={mode}>
      {/* menu toogle button (only for mobile) */}
      <button className="__father-doc-default-navbar-toggle" onClick={onMobileMenuClick} />
      {/* logo & title */}
      <Link
        className="__father-doc-default-navbar-logo"
        style={{
          backgroundImage: logo && `url('${logo}')`,
        }}
        to={rootPath}
      >
        {title}
      </Link>
      <nav>
        {/* navs */}
        {navs.map(nav => (
          <NavLink to={nav.path} key={nav.path}>
            {nav.title}
          </NavLink>
        ))}
        {/* locale select */}
        {Boolean(locales.length) && (
          <div className="__father-doc-default-navbar-locale">
            <select value={locale} onChange={onLocaleChange}>
              {locales.map(locale => (
                <option value={locale.name} key={locale.name}>
                  {locale.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
