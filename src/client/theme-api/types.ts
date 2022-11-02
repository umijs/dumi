import type { ExampleBlockAsset } from 'dumi-assets-types';
import type { ComponentType, ReactNode } from 'react';

export interface IPreviewerProps {
  /**
   * title of current demo
   */
  title?: string;
  /**
   * description of current demo
   */
  description?: string;
  /**
   * file path of current demo
   */
  filePath?: string;
  /**
   * use iframe to render demo
   */
  iframe?: boolean | number;
  /**
   * debug mark (will only render in dev by default)
   */
  debug?: boolean;
  /**
   * disable demo content padding
   */
  compact?: boolean;
  /**
   * add transform property for handle absolute/fixed position element
   */
  transform?: boolean;
  /**
   * background color for demo content
   */
  background?: string;
  /**
   * asset metadata of current demo
   */
  asset: ExampleBlockAsset;
  /**
   * react node of current demo
   */
  children: ReactNode;
  [key: string]: any;
}

export interface IRouteMeta {
  // route frontmatter
  frontmatter: {
    // seo related
    title: string;
    description?: string;
    keywords?: string[];
    // render related
    nav?: string | { title?: string; order?: number };
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
      description?: string;
      [key: string]: any;
    }[];
    toc?: boolean | 'content' | 'menu';
    demo?: {
      cols?: number;
      tocDepth?: number;
    };
    atomId?: string;
    [key: string]: any;
  };
  // route toc
  toc: {
    id: string;
    depth: number;
    title: string;
  }[];
  // route texts
  texts: {
    type?: 'content';
    value: string;
    /**
     * paragraph index
     */
    paraId: number;
    /**
     * title index in toc
     */
    tocIndex?: number;
  }[];
  // tabs
  tabs?: {
    key: string;
    components: {
      default: ComponentType;
      Extra: ComponentType;
      Action: ComponentType;
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
}

type IBasicLocale = { id: string; name: string };
export type ILocale =
  | (IBasicLocale & { base: string })
  | (IBasicLocale & { suffix: string });
export type ILocalesConfig = ILocale[];

export interface INavItem {
  title: string;
  link: string;
  activePath?: string;
  [key: string]: any;
}
interface ISidebarItem {
  title: string;
  link: string;
  order: number;
  frontmatter: IRouteMeta['frontmatter'];
  [key: string]: any;
}
export interface ISidebarGroup {
  title?: string;
  children: ISidebarItem[];
  [key: string]: any;
}
export interface IThemeConfig {
  name?: string;
  logo?: string;
  nav?: (INavItem & { children?: INavItem[] })[];
  sidebar?: Record<string, ISidebarGroup[]>;
  footer?: string;
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
