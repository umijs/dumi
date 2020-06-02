import React, { FC, useContext } from 'react';
import { Link, NavLink } from 'umi';
import { NavbarLink } from './Navbar';
import LocaleSelect from './LocaleSelect';
import context from './context';
import SlugList from './SlugList';
import './SideMenu.less';

interface INavbarProps {
  mobileMenuCollapsed: boolean;
  location: any;
}

const SideMenu: FC<INavbarProps> = ({ mobileMenuCollapsed, location }) => {
  const { logo, title, desc, menus, navs, repoUrl, mode, rootPath, routeMeta } = useContext(
    context,
  );
  const isHiddenMenus =
    Boolean(routeMeta.hero || routeMeta.features || routeMeta.gapless) ||
    routeMeta.sidemenu === false ||
    undefined;

  return (
    <div
      className="__dumi-default-menu"
      data-mode={mode}
      data-hidden={isHiddenMenus}
      data-mobile-show={!mobileMenuCollapsed || undefined}
    >
      <div className="__dumi-default-menu-inner">
        <div className="__dumi-default-menu-header">
          <Link
            to={rootPath}
            className="__dumi-default-menu-logo"
            style={{
              backgroundImage: logo && `url('${logo}')`,
            }}
          />
          <h1>{title}</h1>
          <p>{desc}</p>
          {/* github star badge */}
          {/github\.com/.test(repoUrl) && mode === 'doc' && (
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
        {navs.length ? (
          <div className="__dumi-default-menu-mobile-area">
            <ul className="__dumi-default-menu-nav-list">
              {navs.map(nav => (
                <li key={nav.path || nav.title}>
                  <NavbarLink href={nav.path}>
                    {nav.title}
                    {Boolean(nav.children?.length) && (
                      <ul>
                        {nav.children.map(item => (
                          <li key={item.path || item.title}>
                            <NavbarLink href={item.path}>{item.title}</NavbarLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </NavbarLink>
                </li>
              ))}
            </ul>
            {/* site mode locale select */}
            <LocaleSelect />
          </div>
        ) : (
          <div className="__dumi-default-menu-doc-locale">
            {/* doc mode locale select */}
            <LocaleSelect />
          </div>
        )}
        {/* menu list */}
        <ul className="__dumi-default-menu-list">
          {!isHiddenMenus &&
            menus.map(item => {
              // always use meta from routes to reduce menu data size
              const hasSlugs = Boolean(routeMeta.slugs?.length);
              const hasChildren = item.children && Boolean(item.children.length);
              const show1LevelSlugs =
                routeMeta.toc === 'menu' &&
                !hasChildren &&
                hasSlugs &&
                item.path === location.pathname;

              return (
                <li key={item.path || item.title}>
                  {item.path ? (
                    <NavLink to={item.path} exact={!(item.children && item.children.length)}>
                      {item.title}
                    </NavLink>
                  ) : (
                    <a>{item.title}</a>
                  )}
                  {/* group children */}
                  {Boolean(item.children && item.children.length) && (
                    <ul>
                      {item.children.map(child => (
                        <li key={child.path}>
                          <NavLink to={child.path} exact>
                            <span>{child.title}</span>
                          </NavLink>
                          {/* group children slugs */}
                          {Boolean(
                            routeMeta.toc === 'menu' &&
                              typeof window !== 'undefined' &&
                              child.path === location.pathname &&
                              hasSlugs,
                          ) && (
                            <SlugList
                              base={child.path}
                              slugs={routeMeta.slugs}
                              location={location}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* group slugs */}
                  {show1LevelSlugs && (
                    <SlugList base={item.path} slugs={routeMeta.slugs} location={location} />
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
