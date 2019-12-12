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

  getMetaForCurrentPath = (routes = (this.props.route as any).routes) => {
    let result;
    const {
      location: { pathname },
    } = this.props;

    routes.find(item => {
      if (item.path === pathname) {
        // use valid child routes first, for nest routes scene
        result = item.routes ? item.routes[0].meta : item.meta;
      } else if (item.routes) {
        // continue to find child routes
        const childMeta = this.getMetaForCurrentPath(item.routes);

        result = Object.keys(childMeta).length ? childMeta : null;
      }

      return Boolean(result);
    });

    return result || {};
  };

  renderSideMenu() {
    const { menu, logo, title, desc } = this.props;

    return (
      <div className="__father-doc-default-layout-menu">
        <div className="__father-doc-default-layout-menu-inner">
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
                {item.children && Boolean(item.children.length) && (
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
      </div>
    );
  }

  renderAffix(meta, hash) {
    const { routeLayout = [] } = meta;

    const jumper = routeLayout.map(item => {
      return (
        <li key={item.value} title={item.value}>
          <a
            href={`#${item.heading}`}
            style={{
              paddingLeft: `${(item.depth - 1) * 16 + 10}px`,
            }}
            className={`#${encodeURI(item.heading)}` === hash ? 'current' : ''}
          >
            {item.value}
          </a>
        </li>
      );
    });
    return (
      <div style={{ position: 'fixed', top: '8px', right: '20px' }}>
        <ul className="__father-doc-default-layout-toc">{jumper}</ul>
      </div>
    );
  }

  render() {
    const {
      children,
      location: { hash },
    } = this.props;
    const meta = this.getMetaForCurrentPath();

    const showSidebar = meta.sidebar !== false;

    return (
      <div className="__father-doc-default-layout" data-mode={showSidebar ? '' : 'fullscreen'}>
        {showSidebar && this.renderSideMenu()}
        <div style={{ padding: '0 110px 0 0' }}>
          {this.renderAffix(meta, hash)}
          {children}
        </div>
      </div>
    );
  }
}
