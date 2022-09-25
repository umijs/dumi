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
  // seo related
  title?: string;
  description?: string;
  keywords?: string[];
  // render related
  category?: string;
  order?: number;
  toc?: boolean | 'content' | 'menu';
  demo?: {
    cols?: number;
  };
  [key: string]: any;
}

type IBasicLocale = { id: string; name: string };
export type ILocalesConfig = (
  | (IBasicLocale & { base?: string })
  | (IBasicLocale & { suffix: string })
)[];
