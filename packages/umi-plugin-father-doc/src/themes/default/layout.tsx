import React, { Component } from 'react';
import { RouterTypes } from 'umi';
import router from 'umi/router'
import Link from 'umi/link';
import NavLink from 'umi/navlink';
import scrollama from 'scrollama';
import 'prismjs/themes/prism.css';
import { parse } from 'querystring';
import { IMenu } from '../../routes/getMenuFromRoutes';
import './layout.less';

export interface ILayoutProps {
  title: string;
  logo?: string;
  desc?: string;
  menus: IMenu[];
}

export interface ILayoutState {
  localActive: string;
  headerMenuCollapsed: boolean;
  currentMenuIndex: number;
}

export default class Layout extends Component<ILayoutProps & RouterTypes, ILayoutState> {
  private scrollama;

  state = {
    localActive: '',
    // control side menu in mobile responsive mode
    headerMenuCollapsed: true,
    // save menu index for current locale
    currentMenuIndex: 0,
  };

  static getDerivedStateFromProps({ menus, location }) {
    let state = { currentMenuIndex: 0 };

    // find menu in reverse way to fallback to the first menu
    for (let i = menus.length - 1; i >= 0; i -= 1) {
      const localeName = (menus[i].locale || { name: '' }).name;

      if (location.pathname.startsWith(`/${localeName}`)) {
        state.currentMenuIndex = i;
      }
    }

    return state;
  }

  scrollIntoAnchor() {
    // 如果存在 anchor 滚动过去
    const anchor = parse(this.props.location.search.slice(1)).anchor as string;
    if (anchor) {
      window.setTimeout(() => {
        const dom = document.getElementById(anchor);
        if (dom) {
          dom.scrollIntoView({ behavior: 'smooth' });
        }
      }, 20);
    }
  }

  initializeScrollma() {
    // instantiate the scrollama
    this.scrollama = scrollama();
    const { slugs = [] } = this.getMetaForCurrentPath();

    // setup the instance, pass callback functions
    this.scrollama
      .setup({
        step: '[id]',
        offset: 0.01,
      })
      .onStepEnter(response => {
        const { element } = response;
        if (slugs.map(ele => ele.heading).includes(element.id)) {
          this.setState({ localActive: element.id });
        }
      });

    // setup resize event
    window.addEventListener('resize', this.scrollama.resize);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.initializeScrollma();
    this.scrollIntoAnchor();
  }

  componentDidUpdate(prevProps: ILayoutProps & RouterTypes) {
    if (prevProps.location.search !== this.props.location.search) {
      this.scrollIntoAnchor();
    }
    if (
      prevProps.location.hash !== this.props.location.hash ||
      prevProps.location.pathname !== this.props.location.pathname
    ) {
      this.updateLocale();
    }
  }

  updateLocale() {
    window.scrollTo(0, 0);
    this.scrollama.destroy();
    this.initializeScrollma();
    this.setState({ localActive: '' });
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

  handleLocaleChange = (menuIndex) => {
    const { location: { pathname }, menus } = this.props;
    const currentLocaleName = menus[this.state.currentMenuIndex].locale.name;
    // clear locale prefix from the previous locale
    let newPathname = pathname.replace(`/${currentLocaleName}`, '');

    // append locale prefix to path if it is not the default locale
    if (menuIndex > 0) {
      newPathname = `/${menus[menuIndex].locale.name}${newPathname}`;
    }

    router.push(newPathname)
  }

  renderSideMenu = () => {
    const { headerMenuCollapsed, currentMenuIndex } = this.state;
    const { menus, logo, title, desc } = this.props;

    return (
      <div
        className={`__father-doc-default-layout-menu  ${
          headerMenuCollapsed ? '' : '__father-doc-default-layout-menu-show'
        }`}
      >
        <div className="__father-doc-default-layout-menu-inner">
          <div className="__father-doc-default-layout-menu-header">
            {menus.length > 1 && (
              <div className="__father-doc-default-layout-locale-select">
                <select onChange={ev => this.handleLocaleChange(ev.target.value)}>
                  {menus.map((menu, i) => (
                    <option value={i} key={menu.locale.name}>{menu.locale.label}</option>
                  ))}
                </select>
              </div>
            )}
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
            {menus[currentMenuIndex].items.map(item => (
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
          <a
            className="__father-doc-default-layout-menu-handle"
            onClick={() =>
              this.setState({
                headerMenuCollapsed: !headerMenuCollapsed,
              })
            }
          >
            {headerMenuCollapsed ? '📖' : '📚'}
          </a>
        </div>
      </div>
    );
  };

  renderAffix(meta, search) {
    const { slugs = [] } = meta;
    const { localActive = '' } = this.state;
    const section = parse(search).anchor;

    let realActive = '';
    if (localActive) {
      realActive = localActive;
    } else if (section) {
      realActive = section as string;
    } else {
      realActive = slugs[0].heading;
    }

    const jumper = slugs.map(item => (
      <li
        key={item.heading}
        title={item.value}
        data-depth={item.depth}
        className={realActive === item.heading ? 'active' : ''}
      >
        <Link to={`?anchor=${item.heading}`}>{item.value}</Link>
      </li>
    ));
    return <ul className="__father-doc-default-layout-toc">{jumper}</ul>;
  }

  renderPageHeader = () => {
    const { logo, title, desc } = this.props;
    return (
      <div className="__father-doc-default-layout-header">
        <Link
          to="/"
          className="__father-doc-default-layout-header-logo"
          style={{
            backgroundImage: logo && `url('${logo}')`,
          }}
        />
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
    );
  };

  render() {
    const {
      children,
      location: { search },
    } = this.props;
    const meta = this.getMetaForCurrentPath();
    const showSidebar = meta.sidebar !== false;
    const showSlugs = meta.slugs && Boolean(meta.slugs.length);

    return (
      <div
        className="__father-doc-default-layout"
        data-show-sidebar={showSidebar}
        data-show-slugs={showSlugs}
      >
        {this.renderPageHeader()}
        {showSidebar && this.renderSideMenu()}
        {showSlugs && this.renderAffix(meta, search.slice(1))}
        {children}
      </div>
    );
  }
}
