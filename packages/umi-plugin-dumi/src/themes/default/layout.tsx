import React, { Component } from 'react';
import { Link, RouteProps, history } from 'umi';
import Context from './context';
import { IDumiOpts } from '../..';
import { INav } from '../../routes/getNavFromRoutes';
import { IMenu } from '../../routes/getMenuFromRoutes';
import { ILocale } from '../../routes/getLocaleFromRoutes';
import Navbar from './Navbar';
import SideMenu from './SideMenu';
import SlugList from './SlugList';
import 'prismjs/themes/prism.css';
import './layout.less';

export interface ILayoutProps {
  title: string;
  logo?: string;
  desc?: string;
  navs: INav[];
  menus: IMenu[];
  locales: ILocale[];
  mode: IDumiOpts['mode'];
  repoUrl?: string;
}

export interface ILayoutState {
  menuCollapsed: boolean;
  currentSlug: string;
  currentLocale: string;
  currentRouteMeta: { [key: string]: any };
  scrollDebounceTimer: any;
  navs: INav[0];
  menus: IMenu[0][0];
}

export default class Layout extends Component<ILayoutProps & RouteProps> {
  state: ILayoutState = {
    // control side menu in mobile responsive mode
    menuCollapsed: true,
    // save current slug (anchor)
    currentSlug: '',
    // save current locale
    currentLocale: '',
    // save meta for current route
    currentRouteMeta: {},
    // for anchor scroll listener
    scrollDebounceTimer: null,
    // navs of current locale
    navs: [],
    // menus of current locale & nav path
    menus: [],
  };

  static getDerivedStateFromProps({ locales, navs, location, menus, route }) {
    let navPath = '*';
    const state = {
      currentLocale: (locales[0] || { name: '*' }).name,
      currentRouteMeta:
        (route as any).routes.find(currentRoute => currentRoute.path === location.pathname)?.meta ||
        {},
      currentSlug: /^(#\/|[^#])/.test(window.location.hash)
        ? location.query.anchor
        : decodeURIComponent(location.hash).replace('#', ''),
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

  componentDidMount() {
    window.requestAnimationFrame(() => {
      if (this.state.currentSlug) {
        const elm = document.getElementById(this.state.currentSlug);

        if (elm) {
          document.documentElement.scrollTop = elm.offsetTop - 100;
        }
      }
    });

    window.addEventListener('scroll', this.handleAnchorScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleAnchorScroll);
  }

  componentDidUpdate(_, prevState) {
    if (!this.state.currentSlug && prevState.currentSlug) {
      window.scrollTo(0, 0);
    }
  }

  handleAnchorScroll = () => {
    clearTimeout(this.state.scrollDebounceTimer);
    this.setState({
      scrollDebounceTimer: setTimeout(() => {
        const { slugs = [] } = this.state.currentRouteMeta;

        slugs
          .slice(0)
          .reverse()
          .forEach(({ heading }) => {
            const elm = document.getElementById(heading);
            const { currentSlug } = this.state;
            if (elm && elm.offsetTop - 100 <= document.documentElement.scrollTop) {
              if (heading !== currentSlug) {
                history.push(
                  `${history.location.pathname}${
                    /^(#\/|[^#])/.test(window.location.hash) ? '?anchor=' : '#'
                  }${heading}`,
                );
              }
            }
          });
      }, 200),
    });
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

    history.push(newPathname);
  };

  renderHero = hero => (
    <>
      <div className="__dumi-default-layout-hero">
        <h1>{hero.title}</h1>
        <p>{hero.desc}</p>
        {hero.actions &&
          hero.actions.map(action => (
            <Link to={action.link} key={action.text}>
              <button type="button">{action.text}</button>
            </Link>
          ))}
      </div>
    </>
  );

  renderFeatures = features => (
    <div className="__dumi-default-layout-features">
      {features.map(feat => (
        <dl key={feat.title}>
          <dt>{feat.title}</dt>
          <dd>{feat.desc}</dd>
        </dl>
      ))}
    </div>
  );

  render() {
    const { mode, title, desc, logo, repoUrl, locales, children } = this.props;
    const { navs, menus, menuCollapsed, currentLocale, currentSlug, currentRouteMeta } = this.state;
    const siteMode = Boolean(this.state.navs.length);
    const showHero = siteMode && currentRouteMeta.hero;
    const showFeatures = siteMode && currentRouteMeta.features;
    const showSideMenu = currentRouteMeta.sidemenu !== false && !showHero && !showFeatures;
    const showSlugs = currentRouteMeta.slugs && Boolean(currentRouteMeta.slugs.length) && !siteMode;

    return (
      <Context.Provider
        value={{
          mode,
          title,
          desc,
          repoUrl,
          logo,
          navs,
          menus,
          locales,
          slug: currentSlug,
          locale: currentLocale,
          routeMeta: currentRouteMeta,
          rootPath:
            !locales.length || currentLocale === locales[0].name ? '/' : `/${currentLocale}`,
        }}
      >
        <div
          className="__dumi-default-layout"
          data-show-sidemenu={showSideMenu}
          data-show-slugs={showSlugs}
          data-site-mode={siteMode}
        >
          <Navbar
            onLocaleChange={this.handleLocaleChange}
            onMobileMenuClick={() => this.setState({ menuCollapsed: !menuCollapsed })}
          />
          <SideMenu mobileMenuCollapsed={menuCollapsed} onLocaleChange={this.handleLocaleChange} />
          {showSlugs && (
            <SlugList
              base=""
              slugs={currentRouteMeta.slugs}
              className="__dumi-default-layout-toc"
            />
          )}
          {showHero && this.renderHero(currentRouteMeta.hero)}
          {showFeatures && this.renderFeatures(currentRouteMeta.features)}
          <div className="__dumi-default-layout-content">{children}</div>
        </div>
      </Context.Provider>
    );
  }
}
