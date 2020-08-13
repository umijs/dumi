import React from 'react';
import { IRoute } from '@umijs/types';
import { INav } from '../routes/getNavFromRoutes';
import { IMenu } from '../routes/getMenuFromRoutes';
import { ILocale } from '../routes/getLocaleFromRoutes';
import { IDumiOpts } from '..';

export interface IThemeContext {
  /**
   * documentation config
   */
  config: {
    /**
     * mode type
     */
    mode: 'doc' | 'site';
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
    repository: {
      url?: string;
      branch: string;
    };
    /**
     * logo image URL
     */
    logo?: IDumiOpts['logo'];
    /**
     * navigation configurations
     */
    navs: INav;
    /**
     * sidemenu configurations
     */
    menus: IMenu;
    /**
     * locale configurations
     */
    locales: ILocale[];
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
  /**
   * current menu
   */
  menu: IMenu['locale']['path'];
  /**
   * current nav
   */
  nav: INav['locale'];
  /**
   * base path
   */
  base: string;
  /**
   * documentation routes
   */
  routes: (IRoute & { meta: any })[];
}

export default React.createContext<IThemeContext>({
  config: {
    mode: 'doc',
    title: '',
    navs: {},
    menus: {},
    locales: [],
    repository: { branch: 'master' },
  },
  meta: { title: '' },
  menu: [],
  nav: [],
  base: '',
  routes: [],
});
