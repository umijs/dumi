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
import isHashRoute from '../../utils/isHashRoute';
import getGotoPathName from '../../utils/getGotoPathName';

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

/**
 * 从 route 中根据 pathname 来找到当前的选中 Meta 信息
 * @param route 所有的 router 列表
 * @param location 当前的 pathname 等信息
 * @returns { slugs = [] }
 */
const findCurrentRouteMeta = (route, location) => {
  const currentRouteMeta = (route as any).routes.find(
    currentRoute => currentRoute.path === location.pathname,
  )?.meta;
  if (currentRouteMeta) {
    return currentRouteMeta;
  }
  return {};
};

function getOffsetTop(target: HTMLElement, container: HTMLElement | Window): number {
  if (!target) {
    return 0;
  }

  if (!target.getClientRects().length) {
    return 0;
  }

  const rect = target.getBoundingClientRect();
  if (rect.width || rect.height) {
    if (container === window) {
      container = target.ownerDocument!.documentElement!;
      return rect.top - container.clientTop;
    }
    return rect.top - (container as HTMLElement).getBoundingClientRect().top;
  }

  return rect.top;
}

export interface ILayoutState {
  menuCollapsed: boolean;
  currentSlug: string;
  currentLocale: string;
  currentRouteMeta: { [key: string]: any };
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
    // navs of current locale
    navs: [],
    // menus of current locale & nav path
    menus: [],
  };

  static getDerivedStateFromProps({ locales, navs, location, menus, route }) {
    let navPath = '*';
    const state = {
      currentLocale: (locales[0] || { name: '*' }).name,
      currentRouteMeta: findCurrentRouteMeta(route, location),
      currentSlug: isHashRoute()
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
          // 这里的 68 是顶栏的高度
          document.documentElement.scrollTop = getOffsetTop(elm, document.documentElement) - 68;
        }
      }
    });

    window.addEventListener('scroll', this.debounceOnScroll, {
      passive: true,
    });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.debounceOnScroll);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  timeout: number | null = null;

  timestamp: number = 0;

  /**
   * 带去抖的 handleAnchorScroll
   */
  debounceOnScroll = () => {
    const debounce = 100;
    const { setAnchorToUrl } = this;

    const callNow = !this.timeout;

    if (callNow) {
      setAnchorToUrl();
    }

    const last = Date.now() - this.timestamp;

    if (last < debounce && last >= 0) {
      window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        this.debounceOnScroll();
      }, debounce);
    } else {
      this.timestamp = Date.now();
      setAnchorToUrl();
    }
  };

  setAnchorToUrl = () => {
    if (typeof document === 'undefined') {
      return;
    }
    const { location } = this.props;
    const { slugs = [] } = this.state.currentRouteMeta;
    const { currentSlug } = this.state;
    // 如果当前的 slugs 不含 currentSlug, 就去更新
    const container = window;
    const linkSections: Array<{ heading: string; top: number }> = [];
    [...slugs]
      .filter(({ depth }) => depth > 1)
      // 优先匹配深度比较深的
      .sort((a, b) => a.depth - b.depth)
      .forEach(({ heading }) => {
        // 寻找 dom 节点
        const target = document.getElementById(heading);
        if (!target) {
          return;
        }
        // 68 是顶栏高度，加上之后计算比较精确
        // getOffsetTop 计算的是视口与 dom 元素之间对的相对位置
        // 比 scrollTop 更加精确
        const reactTop = getOffsetTop(target, container) - 68;
        // 为了倾向在 10 和 -8 中选中10，对负值进行加权
        // 加权数选择了容易偏移量的 0.5，较少阈值小时的频繁跳动问题
        const top = reactTop > 0 ? reactTop : Math.abs(reactTop) + 50;
        if (top > 100) {
          return;
        }
        linkSections.push({
          heading,
          top,
        });
      });

    // clear heading if scroll top than first section
    if (document.documentElement.scrollTop < 108) {
      return history.push(location.pathname);
    }

    if (!linkSections.length) {
      return;
    }

    // 在符合的要求的里面选一个最小的
    const maxSection = linkSections.reduce((prev, curr) => (curr.top > prev.top ? curr : prev));

    if (maxSection.heading !== currentSlug) {
      history[currentSlug ? 'replace' : 'push'](
        getGotoPathName(location.pathname, maxSection.heading),
      );
    }
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
          <dd dangerouslySetInnerHTML={{ __html: feat.desc }} />
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
    const showSlugs =
      Boolean(currentRouteMeta.slugs?.length) &&
      (currentRouteMeta.toc === 'content' || (currentRouteMeta.toc === undefined && !siteMode));

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
