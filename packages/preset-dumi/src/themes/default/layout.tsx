import React, { Component } from 'react';
import { Link, RouteProps, history } from 'umi';
import Context from './context';
import { IDumiOpts } from '../..';
import { INav } from '../../routes/getNavFromRoutes';
import { IMenu } from '../../routes/getMenuFromRoutes';
import { ILocale } from '../../routes/getLocaleFromRoutes';
import Navbar from './Navbar';
import SideMenu from './SideMenu';
import SlugList, { scrollToSlug } from './SlugList';
import SearchBar from './SearchBar';
import 'prismjs/themes/prism.css';
import 'katex/dist/katex.min.css';
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
  // remove suffix '/' from pathname
  const pathWithoutSuffix = location.pathname.replace(/(.)\/$/, '$1');
  const currentRoute = (route as any).routes.find(item => item.path === pathWithoutSuffix);

  return currentRoute ? currentRoute.meta || {} : null;
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
      currentSlug: isHashRoute(location)
        ? location.query.anchor
        : decodeURIComponent(location.hash).replace('#', ''),
      navs: [],
      menus: [],
    };
    const isPrefixLocale = state.currentLocale !== locales[0]?.name && state.currentLocale !== '*';
    const rootPath = isPrefixLocale ? `/${state.currentLocale}` : '/';

    // find locale in reverse way
    for (let i = locales.length - 1; i >= 0; i -= 1) {
      const localeName = (locales[i] || { name: '' }).name;

      if (location.pathname.startsWith(`/${localeName}`)) {
        state.currentLocale = localeName;
        break;
      }
    }

    // redirect to home page if there has no matched route
    if (!state.currentRouteMeta && location.pathname !== rootPath) {
      if (typeof window !== undefined) {
        window.location.replace(rootPath);
      }

      // just to avoid throw error
      state.currentRouteMeta = {};
    }

    // find nav in reverse way to fallback to the first nav
    if (location.pathname === rootPath) {
      navPath = rootPath;
    } else if (navs[state.currentLocale]) {
      for (let i = navs[state.currentLocale].length - 1; i >= 0; i -= 1) {
        const nav = navs[state.currentLocale][i];
        const items = [nav].concat(nav.children).filter(Boolean);
        const matched = items.find(
          item =>
            item.path &&
            new RegExp(`^${item.path.replace(/\.html$/, '')}(/|.|$)`).test(location.pathname),
        );

        if (matched) {
          navPath = matched.path;
          break;
        }
      }
    }

    state.navs = navs[state.currentLocale] || [];
    state.menus = menus[state.currentLocale]?.[navPath] || menus[state.currentLocale]?.['*'] || [];
    return state;
  }

  componentDidMount() {
    window.requestAnimationFrame(() => {
      if (this.state.currentSlug) {
        const elm = document.getElementById(this.state.currentSlug);

        if (elm) {
          // 这里的 68 是顶栏的高度
          document.documentElement.scrollTop = getOffsetTop(elm, document.documentElement) - 100;
        }
      }

      window.addEventListener('scroll', this.debounceOnScroll, {
        passive: true,
      });
    });

    // discard end slash for path
    if (/\w\/$/.test(this.props.location.pathname)) {
      history.replace(this.props.location.pathname.replace(/\/$/, '') + this.props.location.hash);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.debounceOnScroll);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      if (this.props.location.hash) {
        scrollToSlug(this.props.location.hash.replace('#', ''));
      } else {
        window.scrollTo(0, 0);
      }
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
    if (document.documentElement.scrollTop === 0) {
      if (location.hash) {
        history.replace(location.pathname);
      }
      return;
    }

    if (!linkSections.length) {
      return;
    }

    // 在符合的要求的里面选一个最小的
    const maxSection = linkSections.reduce((prev, curr) => (curr.top > prev.top ? curr : prev));

    if (maxSection.heading !== currentSlug) {
      history.replace(getGotoPathName(location.pathname, maxSection.heading));
    }
  };

  renderHero = hero => (
    <>
      <div className="__dumi-default-layout-hero">
        <h1>{hero.title}</h1>
        {/* SSR 下只有 div 的 div dangerouslySetInnerHTML 才能渲染 */}
        <div dangerouslySetInnerHTML={{ __html: hero.desc }} />
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
        <dl
          key={feat.title}
          style={{ backgroundImage: feat.icon ? `url(${feat.icon})` : undefined }}
        >
          <dt>{feat.title}</dt>
          <dd dangerouslySetInnerHTML={{ __html: feat.desc }} />
        </dl>
      ))}
    </div>
  );

  render() {
    const { mode, title, desc, logo, repoUrl, locales, algolia, children } = this.props;
    const { navs, menus, menuCollapsed, currentLocale, currentSlug, currentRouteMeta } = this.state;
    const siteMode = this.props.mode === 'site';
    const showHero = siteMode && currentRouteMeta.hero;
    const showFeatures = siteMode && currentRouteMeta.features;
    const showSideMenu =
      currentRouteMeta.sidemenu !== false &&
      !showHero &&
      !showFeatures &&
      !currentRouteMeta.gapless;
    const showSlugs =
      !showHero &&
      !showFeatures &&
      Boolean(currentRouteMeta.slugs?.length) &&
      (currentRouteMeta.toc === 'content' || currentRouteMeta.toc === undefined) &&
      !currentRouteMeta.gapless;
    const isCN =
      currentLocale === 'zh-CN' || (currentLocale === '*' && locales[0]?.name === 'zh-CN');
    let updatedTime: any = new Date(currentRouteMeta.updatedTime);
    const repoPlatform = { github: 'GitHub', gitlab: 'GitLab' }[
      (repoUrl || '').match(/(github|gitlab)/)?.[1] || 'nothing'
    ];

    try {
      updatedTime = updatedTime.toLocaleString(currentLocale);
    } catch {
      updatedTime = updatedTime.toLocaleString();
    }

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
          algolia,
        }}
      >
        <div
          className="__dumi-default-layout"
          data-show-sidemenu={String(showSideMenu)}
          data-show-slugs={String(showSlugs)}
          data-site-mode={siteMode}
          data-gapless={String(!!currentRouteMeta.gapless)}
          onClick={() => this.setState({ menuCollapsed: true })}
        >
          <Navbar
            navPrefix={<SearchBar routes={this.props.route.routes} />}
            onMobileMenuClick={ev => {
              this.setState({ menuCollapsed: !menuCollapsed });
              ev.stopPropagation();
            }}
          />
          <SideMenu mobileMenuCollapsed={menuCollapsed} location={this.props.location} />
          {showSlugs && (
            <SlugList
              base=""
              slugs={currentRouteMeta.slugs}
              location={this.props.location}
              className="__dumi-default-layout-toc"
            />
          )}
          {showHero && this.renderHero(currentRouteMeta.hero)}
          {showFeatures && this.renderFeatures(currentRouteMeta.features)}
          <div className="__dumi-default-layout-content">
            {children}
            {!showHero && !showFeatures && currentRouteMeta.filePath && !currentRouteMeta.gapless && (
              <div className="__dumi-default-layout-footer-meta">
                {repoPlatform && (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${repoUrl}/edit/master/${currentRouteMeta.filePath}`}
                  >
                    {isCN
                      ? `在 ${repoPlatform} 上编辑这篇文档`
                      : `Edit this doc on ${repoPlatform}`}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      x="0px"
                      y="0px"
                      viewBox="0 0 100 100"
                      width="15"
                      height="15"
                      className="__dumi-default-external-link-icon"
                    >
                      <path
                        fill="currentColor"
                        d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
                      />
                      <polygon
                        fill="currentColor"
                        points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
                      />
                    </svg>
                  </a>
                )}
                <span data-updated-text={isCN ? '最后更新时间：' : 'Last Update: '}>
                  {updatedTime}
                </span>
              </div>
            )}
            {(showHero || showFeatures) && currentRouteMeta.footer && (
              <div
                className="__dumi-default-layout-footer"
                dangerouslySetInnerHTML={{ __html: currentRouteMeta.footer }}
              />
            )}
          </div>
        </div>
      </Context.Provider>
    );
  }
}
