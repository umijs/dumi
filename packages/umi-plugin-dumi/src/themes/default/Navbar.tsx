import React, { useContext, FC, MouseEvent, ChangeEvent } from 'react';
import { Link, NavLink } from 'umi';
import context from './context';
import './Navbar.less';

interface INavbarProps {
  onLocaleChange: (ev: ChangeEvent<HTMLSelectElement>) => void;
  onMobileMenuClick: (ev: MouseEvent<HTMLButtonElement>) => void;
}

const Navbar: FC<INavbarProps> = ({ onMobileMenuClick, onLocaleChange }) => {
  const { locale, rootPath, mode, title, logo, locales, navs } = useContext(context);

  return (
    <div className="__dumi-default-navbar" data-mode={mode}>
      {/* menu toogle button (only for mobile) */}
      <button className="__dumi-default-navbar-toggle" onClick={onMobileMenuClick} />
      {/* logo & title */}
      <Link
        className="__dumi-default-navbar-logo"
        style={{
          backgroundImage: logo && `url('${logo}')`,
        }}
        to={rootPath}
      >
        {title}
      </Link>
      <nav>
        {/* navs */}
        {navs.map(nav =>
          /^\/[\w-]/.test(nav.path) ? (
            <NavLink to={nav.path} key={nav.path}>
              {nav.title}
            </NavLink>
          ) : (
            <a target="_blank" href={nav.path} key={nav.path}>
              {nav.title}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                x="0px"
                y="0px"
                viewBox="0 0 100 100"
                width="15"
                height="15"
                className="__dumi-default-external-link-icon"
              >
                <path
                  fill="currentColor"
                  d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
                />
                <polygon
                  fill="currentColor"
                  points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
                />
              </svg>
            </a>
          ),
        )}
        {/* locale select */}
        {Boolean(locales.length) && (
          <div className="__dumi-default-navbar-locale">
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
