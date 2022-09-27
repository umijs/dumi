import { createContext, useContext, type ComponentType } from 'react';
import type { ILocalesConfig, IPreviewerProps, IThemeConfig } from './types';

interface ISiteContext {
  demos: Record<
    string,
    { component: ComponentType; asset: IPreviewerProps['asset'] }
  >;
  locales: NonNullable<ILocalesConfig>;
  themeConfig: IThemeConfig;
}

export const SiteContext = createContext<ISiteContext>({
  demos: {},
  locales: [],
  themeConfig: {},
});

export const useSiteData = () => {
  return useContext(SiteContext);
};
