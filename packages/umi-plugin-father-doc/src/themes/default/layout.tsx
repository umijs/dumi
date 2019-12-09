import React, { Component } from 'react';
import { RouterTypes } from 'umi';
import { Affix } from 'antd';
import Link from 'umi/link';
import NavLink from 'umi/navlink';
import 'prismjs/themes/prism.css';
import { IMenuItem } from '../../routes/getMenuFromRoutes';
import './layout.less';
import slugAnchor from '../../utils/slugAnchor';

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
            <li key={item.path || item.prefix}>
              {item.path ? (
                // render single routes
                <NavLink to={item.path} exact>
                  {item.title}
                </NavLink>
              ) : (
                // render child routes
                <>
                  {/* use NavLink for active, but disable click by css */}
                  <NavLink to={item.prefix}>{item.title}</NavLink>
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
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  renderAffix(meta, hash) {
    const { routeLayout } = meta;

    const jumper = Object.keys(routeLayout).map(item => {
      return (
        <li key={item} title={item}>
          <a
            href={`#${slugAnchor(item)}`}
            className={`#${encodeURI(slugAnchor(item))}` === hash ? 'current' : ''}
          >
            {item}
          </a>
          <ul className="js-guides">
            {routeLayout[item] &&
              Object.keys(routeLayout[item]).map(subItem => {
                return (
                  <li key={subItem}>
                    <a
                      href={`#${slugAnchor(subItem)}`}
                      className={`#${encodeURI(slugAnchor(subItem))}` === hash ? 'current' : ''}
                    >
                      <div dangerouslySetInnerHTML={{ __html: subItem }} />
                    </a>
                  </li>
                );
              })}
          </ul>
        </li>
      );
    });
    return (
      <Affix offsetTop={8} style={{ position: 'absolute', top: '8px', right: '20px' }}>
        <ul className="__father-doc-default-layout-toc">{jumper}</ul>
      </Affix>
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
