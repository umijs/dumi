// Todo: fix definition files cannot be identified problem
/// <reference path="../typings/global.d.ts" />
/// <reference path="../typings/typings.d.ts" />

import React, { Component } from 'react';
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

export default class Layout extends Component<ILayoutProps> {
  render () {
    const { children, menu, logo, title, desc } = this.props;

    return (
      <div className={styles.wrapper}>
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
              <li>
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
                            <li>
                              {item.children.map((child) => (
                                <NavLink to={child.path} exact>
                                  {child.title}
                                </NavLink>
                              ))}
                            </li>
                          </ul>
                        )}
                      </>
                    )
                }
              </li>
            ))}
          </ul>
        </div>
        {children}
      </div>
    );
  }
}
