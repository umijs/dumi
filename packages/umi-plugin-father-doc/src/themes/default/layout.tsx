import React, { Component } from 'react';
import { RouterTypes } from 'umi';
import Link from 'umi/link';
import NavLink from 'umi/navlink';
import 'prismjs/themes/prism.css';
import { IMenuItem } from '../../routes/getMenuFromRoutes';
import './layout.less';

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
    const {
      route,
      location: { pathname },
    } = this.props;
    const current = (route as any).routes.find(item => item.path === pathname);

    return (current && current.meta) || {};
  };

  renderSideMenu() {
    const { menu, logo, title, desc } = this.props;

    return (
      <div className="__father-doc-default-layout-menu">
        <div className="__father-doc-default-layout-menu-header">
          <Link
            to="/"
            className="__father-doc-default-logo"
            style={{
              backgroundImage: logo && `url('${logo}')`,
            }}
          />
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
        <ul>
          {menu.items.map(item => (
            <li key={item.path}>
              <NavLink to={item.path} exact={!(item.children && item.children.length)}>
                {item.title}
              </NavLink>
              {item.children && item.children.length && (
                <ul>
                  {item.children.map(child => (
                    <li key={child.path}>
                      <NavLink to={child.path} exact>
                        {child.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const { children } = this.props;
    const meta = this.getMetaForCurrentPath();
    const showSidebar = meta.sidebar !== false;

    return (
      <div className="__father-doc-default-layout" data-mode={showSidebar ? '' : 'fullscreen'}>
        {showSidebar && this.renderSideMenu()}
        {children}
      </div>
    );
  }
}
