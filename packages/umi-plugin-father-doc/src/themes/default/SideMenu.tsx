import React, { FC, useContext, ChangeEvent } from 'react';
import Link from 'umi/link';
import NavLink from 'umi/navlink';
import context from './context';
import SlugList from './SlugList';
import './SideMenu.less';

interface INavbarProps {
  mobileMenuCollapsed: boolean;
  onLocaleChange: (ev: ChangeEvent<HTMLSelectElement>) => void;
}

const SideMenu: FC<INavbarProps> = ({ mobileMenuCollapsed, onLocaleChange }) => {
  const {
    locale,
    locales,
    logo,
    title,
    desc,
    menus,
    navs,
    repoUrl,
    mode,
    rootPath,
    routeMeta,
  } = useContext(context);

  if (mode === 'site' && (routeMeta.hero || routeMeta.features)) {
    return null;
  }

  return (
    <div
      className="__father-doc-default-menu"
      data-mode={mode}
      data-mobile-show={!mobileMenuCollapsed || undefined}
    >
      <div className="__father-doc-default-menu-inner">
        <div className="__father-doc-default-menu-header">
          {/* locale select */}
          {Boolean(locales.length) && (
            <div className="__father-doc-default-menu-locale">
              <select value={locale} onChange={onLocaleChange}>
                {locales.map(locale => (
                  <option value={locale.name} key={locale.name}>
                    {locale.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Link
            to={rootPath}
            className="__father-doc-default-menu-logo"
            style={{
              backgroundImage: logo && `url('${logo}')`,
            }}
          />
          <h1>{title}</h1>
          <p>{desc}</p>
          {/* github star badge */}
          {/github\.com/.test(repoUrl) && (
            <p>
              <object
                type="image/svg+xml"
                data={`https://img.shields.io/github/stars${
                  repoUrl.match(/((\/[^\/]+){2})$/)[1]
                }?style=social`}
              />
            </p>
          )}
        </div>
        {/* mobile nav list */}
        {Boolean(navs.length) && (
          <ul className="__father-doc-default-menu-nav-list">
            {navs.map(nav => (
              <li key={nav.path}>
                <NavLink to={nav.path}>{nav.title}</NavLink>
              </li>
            ))}
          </ul>
        )}
        {/* menu list */}
        <ul className="__father-doc-default-menu-list">
          {menus.map(item => {
            const location = window.g_history.location;
            const hasSlugs = item.meta.slugs && Boolean(item.meta.slugs.length);
            const hasChildren = item.children && Boolean(item.children.length);
            const show1LevelSlugs =
              mode === 'site' && !hasChildren && hasSlugs && item.path === location.pathname;

            return (
              <li key={item.path}>
                <NavLink to={item.path} exact={!(item.children && item.children.length)}>
                  {item.title}
                </NavLink>
                {/* group children */}
                {Boolean(item.children && item.children.length) && (
                  <ul>
                    {item.children.map(child => (
                      <li key={child.path}>
                        <NavLink to={child.path} exact>
                          {child.title}
                        </NavLink>
                        {/* group children slugs */}
                        {Boolean(
                          mode === 'site' &&
                            child.meta.slugs &&
                            child.meta.slugs.length &&
                            child.path === location.pathname,
                        ) && <SlugList base={child.path} slugs={child.meta.slugs} />}
                      </li>
                    ))}
                  </ul>
                )}
                {/* group slugs */}
                {show1LevelSlugs && <SlugList base={item.path} slugs={item.meta.slugs} />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
