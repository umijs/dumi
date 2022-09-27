import type { ExampleBlockAsset } from 'dumi-assets-types';
import type { ReactNode } from 'react';

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
    toc?: boolean | 'content' | 'menu';
    demo?: {
      cols?: number;
      tocDepth?: number;
    };
  };
  // route toc
  toc: {
    id: string;
    depth: number;
    title: string;
  }[];
  [key: string]: any;
}

type IBasicLocale = { id: string; name: string };
export type ILocalesConfig = (
  | (IBasicLocale & { base: string })
  | (IBasicLocale & { suffix: string })
)[];

export interface INavItem {
  title: string;
  link: string;
  [key: string]: any;
}
interface ISidebarItem {
  title: string;
  link: string;
  [key: string]: any;
}
export interface ISidebarGroup {
  title?: string;
  children: ISidebarItem[];
  [key: string]: any;
}
export interface IThemeConfig {
  nav?: (INavItem & { children?: INavItem[] })[];
  sidebar?: Record<string, ISidebarGroup[]>;
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
