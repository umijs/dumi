import React, { Component } from 'react';
import { RouterTypes } from 'umi';
import router from 'umi/router';
import Link from 'umi/link';
import NavLink from 'umi/navlink';
import scrollama from 'scrollama';
import 'prismjs/themes/prism.css';
import { parse } from 'querystring';
import Context from './context';
import { INav } from '../../routes/getNavFromRoutes';
import { IMenu } from '../../routes/getMenuFromRoutes';
import { ILocale } from '../../routes/getLocaleFromRoutes';
import './layout.less';

export interface ILayoutProps {
  title: string;
  logo?: string;
  desc?: string;
  navs: INav[];
  menus: IMenu[];
  locales: ILocale[];
  repoUrl?: string;
}

export interface ILayoutState {
  localActive: string;
  menuCollapsed: boolean;
  currentLocale: string;
  navs: INav[0];
  menus: IMenu[0][0];
}

export default class Layout extends Component<ILayoutProps & RouterTypes, ILayoutState> {
  private scrollama;

  state = {
    localActive: '',
    // control side menu in mobile responsive mode
    menuCollapsed: true,
    // save current locale
    currentLocale: '',
    // navs of current locale
    navs: [],
    // menus of current locale & nav path
    menus: [],
  };

  static getDerivedStateFromProps({ locales, navs, location, menus }) {
    let navPath = '*';
    let state = {
      currentLocale: (locales[0] || { name: '*' }).name,
      navs: [],
      menus: [],
    };

    // find menu in reverse way to fallback to the first menu
    for (let i = locales.length - 1; i >= 0; i -= 1) {
      const localeName = (locales[i] || { name: '' }).name;

      if (location.pathname.startsWith(`/${localeName}`)) {
        state.currentLocale = localeName;
        break;
      }
    }

    // find nav in reverse way to fallback to the first nav
    if (navs[state.currentLocale]) {
      for (let i = navs[state.currentLocale].length - 1; i >= 0; i -= 1) {
        const nav = navs[state.currentLocale][i];

        if (new RegExp(`^${nav.path}(/|$)`).test(location.pathname)) {
          navPath = nav.path;
          break;
        }
      }
    }

    state.navs = navs[state.currentLocale] || [];
    state.menus = menus[state.currentLocale][navPath] || [];

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

  handleLocaleChange = ev => {
    const {
      location: { pathname },
      locales,
    } = this.props;
    // clear locale prefix from the previous locale
    let newPathname = pathname.replace(`/${this.state.currentLocale}`, '');

    // append locale prefix to path if it is not the default locale
    if (ev.target.value !== locales[0].name) {
      newPathname = `/${ev.target.value}${newPathname}`.replace(/\/$/, '');
    }

    router.push(newPathname);
  };

  renderSideMenu = () => {
    const { menuCollapsed, currentLocale, menus, navs } = this.state;
    const { locales, logo, title, desc, repoUrl, location } = this.props;

    return (
      <div
        className={`__father-doc-default-layout-menu${
          menuCollapsed ? '' : ' __father-doc-default-layout-menu-show'
        }`}
      >
        <div className="__father-doc-default-layout-menu-inner">
          <div className="__father-doc-default-layout-menu-header">
            {locales.length > 1 && (
              <div className="__father-doc-default-layout-locale-select">
                <select value={currentLocale} onChange={this.handleLocaleChange}>
                  {locales.map(locale => (
                    <option value={locale.name} key={locale.name}>
                      {locale.label}
                    </option>
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
          {Boolean(navs.length) && (
            <ul className="__father-doc-default-layout-menu-nav">
              {navs.map(nav => (
                <li key={nav.path}>
                  <NavLink to={nav.path}>{nav.title}</NavLink>
                </li>
              ))}
            </ul>
          )}
          <ul>
            {menus.map(item => {
              const show1LevelSlugs =
                (!item.children || !item.children.length) &&
                (item.meta.slugs || item.meta.slugs.length);

              return (
                <li key={item.path}>
                  <NavLink to={item.path} exact={!(item.children && item.children.length)}>
                    {item.title}
                  </NavLink>
                  {Boolean(item.children && item.children.length) && (
                    <ul>
                      {item.children.map(child => (
                        <li key={child.path}>
                          <NavLink to={child.path} exact>
                            {child.title}
                          </NavLink>
                          {Boolean(
                            child.meta.slugs &&
                              child.meta.slugs.length &&
                              child.path === location.pathname,
                          ) && (
                            <ul>
                              {child.meta.slugs.map(slug => (
                                <li key={slug.heading} data-depth={slug.depth}>
                                  <Link to={`${item.path}?anchor=${slug.heading}`}>
                                    {slug.value}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {Boolean(show1LevelSlugs) && (
                    <ul>
                      {item.meta.slugs.map(slug => (
                        <li key={slug.heading} data-depth={slug.depth}>
                          <Link to={`${item.path}?anchor=${slug.heading}`}>{slug.value}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
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

  renderNavBar = () => {
    const { currentLocale, menuCollapsed, navs } = this.state;
    const { title, locales, logo } = this.props;

    return (
      <div className="__father-doc-default-layout-navbar">
        <button
          className="__father-doc-default-layout-navbar-toggle"
          onClick={() => this.setState({ menuCollapsed: !menuCollapsed })}
        />
        <Link
          className="__father-doc-default-layout-navbar-logo"
          style={{
            backgroundImage: logo && `url('${logo}')`,
          }}
          to={!locales.length || currentLocale === locales[0].name ? '/' : `/${currentLocale}`}
        >
          {title}
        </Link>
        <nav>
          {navs.map(nav => (
            <NavLink to={nav.path} key={nav.path}>
              {nav.title}
            </NavLink>
          ))}
          {Boolean(locales.length) && (
            <div className="__father-doc-default-layout-navbar-locale">
              <select value={currentLocale} onChange={this.handleLocaleChange}>
                {locales.map(locale => (
                  <option value={locale.name} key={locale.name}>
                    {locale.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </nav>
      </div>
    );
  };

  renderHero(hero) {
    return (
      <>
        <div className="__father-doc-default-layout-hero">
          <h1>{hero.text}</h1>
          <p>{hero.desc}</p>
          {hero.actions &&
            hero.actions.map(action => (
              <Link to={action.link} key={action.text}>
                <button>{action.text}</button>
              </Link>
            ))}
        </div>
        <div>
          <dl>
            <dt></dt>
            <dd></dd>
          </dl>
        </div>
      </>
    );
  }

  renderFeatures(features) {
    return (
      <div className="__father-doc-default-layout-features">
        {features.map(feat => (
          <dl key={feat.title}>
            <dt>{feat.title}</dt>
            <dd>{feat.desc}</dd>
          </dl>
        ))}
      </div>
    );
  }

  render() {
    const {
      children,
      location: { search },
    } = this.props;
    const meta = this.getMetaForCurrentPath();
    const siteMode = Boolean(this.state.navs.length);
    const showHero = siteMode && meta.hero;
    const showFeatures = siteMode && meta.features;
    const showSidebar = meta.sidebar !== false && !showHero && !showFeatures;
    const showSlugs = meta.slugs && Boolean(meta.slugs.length) && !siteMode;

    return (
      <Context.Provider
        value={{
          locale: this.state.currentLocale,
        }}
      >
        <div
          className="__father-doc-default-layout"
          data-show-sidebar={showSidebar}
          data-show-slugs={showSlugs}
          data-site-mode={siteMode}
        >
          {this.renderNavBar()}
          {showSidebar && this.renderSideMenu()}
          {showSlugs && this.renderAffix(meta, search.slice(1))}
          {showHero && this.renderHero(meta.hero)}
          {showFeatures && this.renderFeatures(meta.features)}
          <div className="__father-doc-default-layout-content">{children}</div>
        </div>
      </Context.Provider>
    );
  }
}
