import React, { FC, useContext } from 'react';
import { Link, NavLink } from 'umi';
import LocaleSelect from './LocaleSelect';
import context from './context';
import SlugList from './SlugList';
import './SideMenu.less';

interface INavbarProps {
  mobileMenuCollapsed: boolean;
  location: any;
}

const SideMenu: FC<INavbarProps> = ({ mobileMenuCollapsed }) => {
  const { logo, title, desc, menus, navs, repoUrl, mode, rootPath, routeMeta } = useContext(
    context,
  );

  return (
    <div
      className="__dumi-default-menu"
      data-mode={mode}
      data-hidden={
        Boolean(routeMeta.hero || routeMeta.features) || routeMeta.sidemenu === false || undefined
      }
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
        {Boolean(navs.length) ? (
          <div className="__dumi-default-menu-mobile-area">
            <ul className="__dumi-default-menu-nav-list">
              {navs.map(nav => (
                <li key={nav.path}>
                  {/^\/[\w-]/.test(nav.path) ? (
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
                  )}
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
          {menus.map(item => {
            // always use meta from routes to reduce menu data size
            const hasSlugs = Boolean(routeMeta.slugs?.length);
            const hasChildren = item.children && Boolean(item.children.length);
            const show1LevelSlugs =
              routeMeta.toc === 'menu' &&
              !hasChildren &&
              hasSlugs &&
              (typeof window !== 'undefined' && item.path === location.pathname);

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
                          routeMeta.toc === 'menu' && typeof window !== 'undefined' && child.path === location.pathname && hasSlugs,
                        ) && <SlugList base={child.path} slugs={routeMeta.slugs} />}
                      </li>
                    ))}
                  </ul>
                )}
                {/* group slugs */}
                {show1LevelSlugs && <SlugList base={item.path} slugs={routeMeta.slugs} />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
