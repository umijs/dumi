import type { PICKED_PKG_FIELDS } from '@/constants';
import type { AtomComponentAsset } from 'dumi-assets-types';
import { createContext, useContext, type ComponentType } from 'react';
import { reactDemoRuntimeApi } from './reactDemoRuntimeApi';
import type {
  ILocalesConfig,
  IPreviewerProps,
  ITechStackRuntimeApi,
  IThemeConfig,
} from './types';

export interface ISiteContext {
  pkg: Partial<Record<keyof typeof PICKED_PKG_FIELDS, any>>;
  historyType: 'browser' | 'hash' | 'memory';
  entryExports: Record<string, any>;
  demos: Record<
    string,
    {
      id: string;
      component: ComponentType;
      asset: IPreviewerProps['asset'];
      routeId: string;
      render?: (el: HTMLElement, component: any) => Promise<() => void>;
    }
  >;
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

export const TechStackRuntimeContext =
  createContext<ITechStackRuntimeApi>(reactDemoRuntimeApi);

export const useTechStackRuntimeApi = () => {
  return useContext(TechStackRuntimeContext);
};
