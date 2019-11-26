// Todo: fix definition files cannot be identified problem
/// <reference path="../typings/global.d.ts" />
/// <reference path="../typings/typings.d.ts" />

import React, { Component, MouseEvent } from 'react';
import { IMenuItem } from '../../routes/getMenuFromRoutes';
import 'prismjs/themes/prism.css';
import styles from './layout.less';

export interface ILayoutProps {
  menu: {
    items: IMenuItem[];
  };
}

export default class Layout extends Component<ILayoutProps> {
  handleMenuItemClick = (e: MouseEvent, path: string) => {
    window.g_history.push(path);
    e.preventDefault();
  }

  render () {
    const { children, menu } = this.props;

    return (
      <div className={styles.wrapper}>
        <div className={styles.menu}>
          <ul>
            {menu.items.map((item) => (
              <li>
                <a
                  href={item.path}
                  onClick={e => this.handleMenuItemClick(e, item.path)}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {children}
      </div>
    );
  }
}
