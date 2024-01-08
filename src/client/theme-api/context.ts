import type { PICKED_PKG_FIELDS } from '@/constants';
import type { AtomComponentAsset } from 'dumi-assets-types';
import { createContext, useContext } from 'react';
import type { IDemoData, ILocalesConfig, IThemeConfig } from './types';

export interface ISiteContext {
  pkg: Partial<Record<keyof typeof PICKED_PKG_FIELDS, any>>;
  historyType: 'browser' | 'hash' | 'memory';
  entryExports: Record<string, any>;
  demos: Record<string, IDemoData>;
  components: Record<string, AtomComponentAsset>;
  locales: ILocalesConfig;
  themeConfig: IThemeConfig;
  hostname?: string;
  loading: boolean;
  setLoading: (status: boolean) => void;
  /**
   * private field, do not use it in your code
   */
  _2_level_nav_available: boolean;
}

export const SiteContext = createContext<ISiteContext>({
  pkg: {},
  historyType: 'browser',
  entryExports: {},
  demos: {},
  components: {},
  locales: [],
  themeConfig: {} as IThemeConfig,
  loading: false,
  setLoading: () => {},
  _2_level_nav_available: true,
});

export const useSiteData = () => {
  return useContext(SiteContext);
};
