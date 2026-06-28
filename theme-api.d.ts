import type {
  AtomAsset,
  AtomComponentAsset,
  ExampleBlockAsset,
  ExamplePresetAsset,
} from 'dumi-assets-types';
import type { TypeMap } from 'dumi-assets-types/typings/atom/props/types';
import type {
  FC,
  ComponentType as ReactComponentType,
  ReactNode,
  RefObject,
} from 'react';

export {
  FormattedDate,
  FormattedDateParts,
  FormattedDisplayName,
  FormattedList,
  FormattedMessage,
  FormattedNumber,
  FormattedNumberParts,
  FormattedPlural,
  FormattedRelativeTime,
  FormattedTime,
  FormattedTimeParts,
  IntlContext,
  IntlProvider,
  RawIntlProvider,
  createIntlCache,
  defineMessages,
  injectIntl,
  useIntl,
} from 'react-intl';

export interface IPreviewerProps {
  title?: string;
  description?: string;
  filename?: string;
  iframe?: boolean | number;
  debug?: boolean;
  defaultShowCode?: boolean;
  demoUrl: string;
  compact?: boolean;
  transform?: boolean;
  background?: string;
  asset: ExampleBlockAsset;
  children: ReactNode;
  _live_in_iframe?: boolean;
  [key: string]: any;
}

export interface IRouteMeta {
  frontmatter: {
    title: string;
    description?: string;
    keywords?: string[];
    nav?:
      | string
      | {
          title?: string;
          order?: number;
          second?: Omit<IRouteMeta['frontmatter']['nav'], 'second'>;
        };
    group?: string | { title?: string; order?: number };
    order?: number;
    hero?: {
      title?: string;
      description?: string;
      background?: string;
      actions?: { text: string; link: string }[];
      [key: string]: any;
    };
    features?: {
      emoji?: string;
      title?: string;
      link?: string;
      description?: string;
      [key: string]: any;
    }[];
    toc?: boolean | 'content' | 'menu';
    demo?: {
      cols?: number;
      tocDepth?: number;
    };
    atomId?: string;
    filename?: string;
    lastUpdated?: number;
    debug?: boolean;
    sidebar?: boolean;
    [key: string]: any;
  };
  toc: { id: string; depth: number; title: string; _debug_demo?: boolean }[];
  texts: {
    type?: 'content';
    value: string;
    paraId: number;
    tocIndex?: number;
  }[];
  tabs?: {
    key: string;
    title?: string;
    titleIntlId?: string;
    components: {
      default: ReactComponentType;
      Extra: ReactComponentType;
      Action: ReactComponentType;
    };
    meta: {
      frontmatter: Omit<
        IRouteMeta['frontmatter'],
        'description' | 'keywords' | 'nav' | 'group' | 'hero' | 'features'
      >;
      toc: IRouteMeta['toc'];
      texts: IRouteMeta['texts'];
      [key: string]: any;
    };
  }[];
  _atom_route?: boolean;
}

type IBasicLocale = { id: string; name: string };
export type ILocale =
  | (IBasicLocale & { base: string })
  | (IBasicLocale & { suffix: string });
export type ILocalesConfig = ILocale[];
export interface INavItem {
  title: string;
  link?: string;
  order?: number;
  activePath?: string;
  [key: string]: any;
}
export interface ISidebarItem {
  title: string;
  link: string;
  order?: number;
  frontmatter?: IRouteMeta['frontmatter'];
  [key: string]: any;
}
export interface ISidebarGroup {
  title?: string;
  children: ISidebarItem[];
  [key: string]: any;
}
export type SocialTypes =
  | 'github'
  | 'weibo'
  | 'twitter'
  | 'x'
  | 'gitlab'
  | 'facebook'
  | 'zhihu'
  | 'yuque'
  | 'linkedin';
export type INavItems = (INavItem & { children?: INavItem[] })[];
export type IUserNavItem = Pick<INavItem, 'title' | 'link' | 'activePath'>;
export type IUserNavMode = 'override' | 'append' | 'prepend';
export type IUserNavItems = (IUserNavItem & { children?: IUserNavItem[] })[];
export type IUserNavValue = IUserNavItems | Record<string, IUserNavItems>;
export type NavWithMode<T extends IUserNavValue> = {
  mode: IUserNavMode;
  value: T;
};
export interface IThemeConfig {
  name?: string;
  logo?: string | false;
  nav?: IUserNavValue | NavWithMode<IUserNavValue>;
  sidebar?: Record<string, ISidebarGroup[]>;
  footer?: string | false;
  showLineNum?: boolean;
  prefersColor: {
    default: 'light' | 'dark' | 'auto';
    switch: boolean;
  };
  nprogress?: boolean;
  socialLinks?: { [key in SocialTypes]?: string };
  editLink?: boolean | string;
  sourceLink?: boolean | string;
  lastUpdated?: boolean;
  [key: string]: any;
}
export type IRoutesById = Record<
  string,
  {
    path?: string;
    parentId?: string;
    meta?: IRouteMeta;
    id: string;
    redirect?: string;
    [key: string]: any;
  }
>;
export type AgnosticComponentModule = { default?: any; [key: string]: any };
export type AgnosticComponentType =
  | Promise<AgnosticComponentModule>
  | AgnosticComponentModule;
export type IDemoCompileFn = (
  code: string,
  opts: { filename: string },
) => Promise<string>;
export type IDemoCancelableFn = (
  canvas: HTMLElement,
  component: AgnosticComponentModule,
) => (() => void) | Promise<() => void>;
export type IDemoPreflightFn = (
  component: AgnosticComponentModule,
) => Promise<void>;
export type IDemoData = {
  component: ReactComponentType | AgnosticComponentType;
  asset: IPreviewerProps['asset'];
  routeId: string;
  context?: Record<string, unknown>;
  renderOpts?: {
    compile?: IDemoCompileFn;
    renderer?: IDemoCancelableFn;
    preflight?: IDemoPreflightFn;
  };
};
export interface ISiteContext {
  pkg: Record<string, any>;
  historyType: 'browser' | 'hash' | 'memory';
  entryExports: Record<string, any>;
  demos: Record<string, IDemoData>;
  components: Record<string, AtomComponentAsset>;
  locales: ILocalesConfig;
  themeConfig: IThemeConfig;
  hostname?: string;
  loading: boolean;
  setLoading: (status: boolean) => void;
  _2_level_nav_available: boolean;
  [key: string]: any;
}
export interface IDumiDemoProps {
  demo: { id: string; inline?: boolean };
  previewerProps: Omit<IPreviewerProps, 'asset' | 'children'>;
}
export interface IDumiDemoGridProps {
  items: IDumiDemoProps[];
  demoRender?: (item: IDumiDemoProps) => ReactNode;
}
export type IColorValue = 'light' | 'dark';
export type IPrefersColorValue = IColorValue | 'auto';
export interface IHighlightText {
  highlighted?: boolean;
  text: string;
}
export interface ISearchNavResult {
  title?: string;
  priority: number;
  hints: {
    type: 'page' | 'title' | 'demo' | 'content';
    link: string;
    priority: number;
    pageTitle: string;
    highlightTitleTexts: IHighlightText[];
    highlightTexts: IHighlightText[];
  }[];
}
export type ISearchResult = ISearchNavResult[];
export interface IAtomRendererProps {
  type: AtomAsset['type'];
  value: ExamplePresetAsset['value'];
  processor?: (
    entity: TypeMap['element'] | TypeMap['function'] | TypeMap['dom'],
    entryExports: Record<string, any>,
  ) => any;
}
export declare const AtomRenderer: FC<IAtomRendererProps>;
export declare const DumiDemo: FC<IDumiDemoProps>;
export declare const DumiDemoGrid: FC<IDumiDemoGridProps>;
export declare const DumiPage: FC<{ children: ReactNode }>;
export declare const useSiteData: () => ISiteContext;
export declare const useAtomAssets: () => {
  components: Record<string, AtomComponentAsset>;
};
export declare const useLiveDemo: (
  id: string,
  opts?: { containerRef?: RefObject<HTMLElement>; iframe?: boolean },
) => {
  node: ReactNode;
  loading: boolean;
  error: Error | null;
  setSource: (source: Record<string, string>) => void;
};
export declare const useLocale: () => ILocale;
export declare const useNavData: () => INavItems;
export declare const usePrefersColor: () => [
  IColorValue,
  IPrefersColorValue,
  (value: IPrefersColorValue) => void,
];
export declare const useMatchedRoute: () => IRoutesById[string];
export declare const useRouteMeta: () => IRouteMeta;
export declare const useFullSidebarData: () => NonNullable<
  IThemeConfig['sidebar']
>;
export declare const useSidebarData: () => ISidebarGroup[];
export declare const useSiteSearch: () => {
  keywords: string;
  setKeywords: (keywords: string) => void;
  result: ISearchResult;
  loading: boolean;
  load: () => Promise<void>;
};
export declare const useTabMeta: () =>
  | NonNullable<IRouteMeta['tabs']>[number]['meta']
  | undefined;
export declare const openCodeSandbox: (data: IPreviewerProps) => void;
export declare const openStackBlitz: (data: IPreviewerProps) => void;
export declare function useDemo(id: string): IDemoData | undefined;
export declare function getFullDemos(opts?: {
  loadLazy?: boolean;
}): Promise<Record<string, IDemoData>>;
export declare function getRouteMetaById<T extends { syncOnly?: boolean }>(
  id: string,
  opts?: T,
): T extends { syncOnly: true } ? IRouteMeta | undefined : Promise<IRouteMeta>;
export declare function getFullRoutesMeta(): Promise<
  Record<string, IRouteMeta>
>;
