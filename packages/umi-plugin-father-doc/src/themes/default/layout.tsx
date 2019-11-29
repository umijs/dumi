// Todo: fix definition files cannot be identified problem
/// <reference path="../typings/global.d.ts" />
/// <reference path="../typings/typings.d.ts" />

import React, { Component } from 'react';
import { RouterTypes } from 'umi';
import Link from 'umi/link';
import NavLink from 'umi/navlink';
import 'prismjs/themes/prism.css';
import { IMenuItem } from '../../routes/getMenuFromRoutes';
import styles from './layout.less';

export interface ILayoutProps {
  title: string;
  logo?: string;
  desc?: string;
  menu: {
    items: IMenuItem[];
  };
}

export default class Layout extends Component<ILayoutProps & RouterTypes> {
  componentDidMount() {
    window.g_history.listen(() => {
      window.scrollTo(0, 0);
    });
  }

  getMetaForCurrentPath = () => {
    const { route, location: { pathname } } = this.props;
    const current = (route as any).routes.find(item => item.path === pathname);

    return (current && current.meta) || {};
  }

  renderSideMenu() {
    const { menu, logo, title, desc } = this.props;

    return (
      <div className={styles.menu}>
        <div className={styles.menuHeader}>
          <Link
            to="/"
            className={styles.logo}
            style={{
              backgroundImage: logo && `url('${logo}')`,
            }}
          />
            <h1>{title}</h1>
            <p>{desc}</p>
        </div>
        <ul>
          {menu.items.map((item) => (
            <li key={item.path || item.prefix}>
              {
                item.path
                  ? (
                    // render single routes
                    <NavLink to={item.path} exact>
                      {item.title}
                    </NavLink>
                  )
                  : (
                    // render child routes
                    <>
                      {/* use NavLink for active, but disable click by css */}
                      <NavLink
                        to={item.prefix}
                        data-group
                      >
                        {item.title}
                      </NavLink>
                      {item.children && item.children.length && (
                        <ul>
                          {item.children.map((child) => (
                            <li key={child.path}>
                              <NavLink to={child.path} exact>
                                {child.title}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )
              }
            </li>
          ))}
        </ul>
      </div>
    );
  }

  render () {
    const { children } = this.props;
    const meta = this.getMetaForCurrentPath();
    const showSidebar = meta.sidebar !== false;

    return (
      <div className={styles.wrapper} data-mode={showSidebar ? '' : 'fullscreen'}>
        {showSidebar && this.renderSideMenu()}
        {children}
      </div>
    );
  }
}
