import { IRoute } from '@umijs/types';
import { INavItem, INav } from './routes/getNavFromRoutes';
import { IMenuItem } from './routes/getMenuFromRoutes';

export interface IDumiOpts {
  title?: string;
  logo?: string | boolean;
  mode?: 'doc' | 'site';
  description?: string;
  locales?: [string, string][];
  resolve?: {
    previewLangs?: string[];
    includes?: string[];
    examples?: string[];
  };
  menus?: { [key: string]: IMenuItem[] };
  navs?: INav | INavItem[];
  routes?: {
    path: IRoute['path'];
    component: IRoute['component'];
    redirect: IRoute['redirect'];
    [key: string]: any;
  }[];
  algolia?: {
    apiKey: string;
    indexName: string;
    debug?: boolean;
  };
}

export default () => {
  return {
    plugins: [
      require.resolve('./plugins/title'),
      require.resolve('./plugins/description'),
      require.resolve('./plugins/logo'),
      require.resolve('./plugins/locales'),
      require.resolve('./plugins/mode'),
      require.resolve('./plugins/menus'),
      require.resolve('./plugins/navs'),
      require.resolve('./plugins/resolve'),
      require.resolve('./plugins/core'),
      require.resolve('./plugins/algolia'),
    ],
  };
};
