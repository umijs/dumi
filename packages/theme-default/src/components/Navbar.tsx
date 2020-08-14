import React, { useContext, FC, MouseEvent } from 'react';
import { context, Link, NavLink } from 'dumi/theme';
import LocaleSelect from './LocaleSelect';
import './Navbar.less';

interface INavbarProps {
  navPrefix?: React.ReactNode;
  onMobileMenuClick: (ev: MouseEvent<HTMLButtonElement>) => void;
}

const Navbar: FC<INavbarProps> = ({ onMobileMenuClick, navPrefix }) => {
  const {
    base,
    config: { mode, title, logo },
    nav,
  } = useContext(context);

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
        to={base}
        data-plaintext={logo === false || undefined}
      >
        {title}
      </Link>
      <nav>
        {navPrefix}
        {/* navs */}
        {nav.map(nav => {
          const child = Boolean(nav.children?.length) && (
            <ul>
              {nav.children.map(item => (
                <li key={item.path}>
                  <NavLink to={item.path}>{item.title}</NavLink>
                </li>
              ))}
            </ul>
          );

          return nav.path ? (
            <NavLink to={nav.path} key={nav.path}>
              {nav.title}
              {child}
            </NavLink>
          ) : (
            <span key={nav.title}>
              {nav.title}
              {child}
            </span>
          );
        })}
        <LocaleSelect />
      </nav>
    </div>
  );
};

export default Navbar;
