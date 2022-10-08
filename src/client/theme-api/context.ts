import type { AtomComponentAsset } from 'dumi-assets-types';
import { createContext, useContext, type ComponentType } from 'react';
import type { ILocalesConfig, IPreviewerProps, IThemeConfig } from './types';

interface ISiteContext {
  demos: Record<
    string,
    { component: ComponentType; asset: IPreviewerProps['asset'] }
  >;
  components: Record<string, AtomComponentAsset>;
  locales: NonNullable<ILocalesConfig>;
  themeConfig: IThemeConfig;
  loading: boolean;
  setLoading: (status: boolean) => void;
}

export const SiteContext = createContext<ISiteContext>({
  demos: {},
  components: {},
  locales: [],
  themeConfig: {},
  loading: false,
  setLoading: () => {},
});

export const useSiteData = () => {
  return useContext(SiteContext);
};
