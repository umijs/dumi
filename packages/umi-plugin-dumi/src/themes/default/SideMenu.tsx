import React, { FC, useContext, ChangeEvent } from 'react';
import { Link, NavLink, history } from 'umi';
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

  return (
    <div
      className="__dumi-default-menu"
      data-mode={mode}
      data-homepage={Boolean(routeMeta.hero || routeMeta.features) || undefined}
      data-mobile-show={!mobileMenuCollapsed || undefined}
    >
      <div className="__dumi-default-menu-inner">
        <div className="__dumi-default-menu-header">
          {/* locale select */}
          {Boolean(locales.length) && (
            <div className="__dumi-default-menu-locale">
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
            className="__dumi-default-menu-logo"
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
          <ul className="__dumi-default-menu-nav-list">
            {navs.map(nav => (
              <li key={nav.path}>
                <NavLink to={nav.path}>{nav.title}</NavLink>
              </li>
            ))}
          </ul>
        )}
        {/* menu list */}
        <ul className="__dumi-default-menu-list">
          {menus.map(item => {
            const location = history.location;
            // always use meta from routes to reduce menu data size
            const hasSlugs = Boolean(routeMeta.slugs?.length);
            const hasChildren = item.children && Boolean(item.children.length);
            const show1LevelSlugs =
              mode === 'site' && !hasChildren && hasSlugs && item.path === location.pathname;

            return (
              <li key={item.title}>
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
                          {child.title}
                        </NavLink>
                        {/* group children slugs */}
                        {Boolean(
                          (routeMeta.toc === 'menu' ||
                            (routeMeta.toc === undefined && mode === 'site')) &&
                            child.path === location.pathname &&
                            hasSlugs,
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
