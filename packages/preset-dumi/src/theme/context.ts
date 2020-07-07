import React from 'react';
import { IDumiOpts } from '..';

export interface IThemeContext {
  /**
   * documentation config
   */
  config: {
    /**
     * site title
     */
    title: IDumiOpts['title'];
    /**
     * site description
     */
    description?: IDumiOpts['description'];
    /**
     * documentation repository URL
     */
    repoUrl?: string;
    /**
     * logo image URL
     */
    logo?: IDumiOpts['logo'];
    /**
     * navigation configurations
     */
    navs: IDumiOpts['navs'];
    /**
     * sidemenu configurations
     */
    menus: IDumiOpts['menus'];
    /**
     * locale configurations
     */
    locales: IDumiOpts['locales'];
    /**
     * algolia configurations
     */
    algolia?: IDumiOpts['algolia'];
  };
  /**
   * the meta information of current route
   */
  meta: {
    /**
     * page title
     */
    title: string;
    /**
     * control sidemenu display
     */
    sidemenu?: boolean;
    /**
     * control toc position in page
     */
    toc?: false | 'content' | 'menu';
    // TODO: https://d.umijs.org/config/frontmatter#markdown-%E6%94%AF%E6%8C%81%E7%9A%84-frontmatter-%E9%85%8D%E7%BD%AE%E9%A1%B9
    [key: string]: any;
  };
  /**
   * current locale
   */
  locale?: string;
}

export default React.createContext<IThemeContext>({
  config: { title: '', navs: [], menus: {}, locales: [] },
  meta: { title: '' },
});
