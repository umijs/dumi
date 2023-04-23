import type { PICKED_PKG_FIELDS } from '@/constants';
import type { AtomComponentAsset } from 'dumi-assets-types';
import { createContext, useContext, type ComponentType } from 'react';
import type { ILocalesConfig, IPreviewerProps, IThemeConfig } from './types';

interface ISiteContext {
  pkg: Partial<Record<keyof typeof PICKED_PKG_FIELDS, any>>;
  historyType: 'browser' | 'hash' | 'memory';
  entryExports: Record<string, any>;
  demos: Record<
    string,
    {
      component: ComponentType;
      asset: IPreviewerProps['asset'];
      routeId: string;
    }
  >;
  components: Record<string, AtomComponentAsset>;
  locales: ILocalesConfig;
  themeConfig: IThemeConfig;
  loading: boolean;
  setLoading: (status: boolean) => void;
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
});

export const useSiteData = () => {
  return useContext(SiteContext);
};
