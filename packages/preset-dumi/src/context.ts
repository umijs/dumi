import { IApi } from '@umijs/types';
import { IMenuItem } from './routes/getMenuFromRoutes';
import { INav, INavItem } from './routes/getNavFromRoutes';

export interface IDumiOpts {
  /**
   * site title
   * @default   package name
   */
  title: string;
  /**
   * site logo
   * @default   Umi logo
   */
  logo?: string | boolean;
  /**
   * render mode
   * @default   doc
   * @refer     https://d.umijs.org/guide/mode
   */
  mode: 'doc' | 'site';
  /**
   * site description
   * @note  only available in site mode
   */
  description?: string;
  /**
   * site languages
   * @default  [['en-US', 'EN'], ['zh-CN', '中文']]
   */
  locales: [string, string][];
  /**
   * resolve config
   */
  resolve: {
    /**
     * which code block language will be rendered as React component
     * @default   ['jsx', 'tsx']
     */
    previewLangs: string[];
    /**
     * configure the markdown directory for dumi searching
     * @default   ['docs', 'src'] or ['docs', 'packages/pkg/src']
     */
    includes: string[];
    /**
     * TBD
     */
    examples: string[];
  };
  /**
   * customize the side menu
   * @note  only available in site mode
   */
  menus?: { [key: string]: IMenuItem[] };
  /**
   * customize the navigations
   * @note  only available in site mode
   */
  navs?: INav | INavItem[];
  /**
   * enable algolia searching
   */
  algolia?: {
    apiKey: string;
    indexName: string;
    debug?: boolean;
  };
}

const context: { umi?: IApi; opts?: IDumiOpts } = {};

/**
 * initialize context
 * @param umi   umi api
 * @param opts  dumi config
 */
export function init(umi: IApi, opts: IDumiOpts) {
  context.umi = umi;
  context.opts = opts;
}

/**
 * set dumi options in context
 * @param key   config key
 * @param value config value
 */
export function setOptions(key: keyof IDumiOpts, value: any) {
  context.opts[key] = value;
}

export default context;
