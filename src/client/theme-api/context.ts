import { createContext, type ComponentType } from 'react';
import type { ILocalesConfig, IPreviewerProps, IThemeConfig } from './types';

export interface IThemeContext {
  demos: Record<
    string,
    { component: ComponentType; asset: IPreviewerProps['asset'] }
  >;
  locales: NonNullable<ILocalesConfig>;
  themeConfig: IThemeConfig;
}

export const Context = createContext<IThemeContext>({
  demos: {},
  locales: [],
  themeConfig: {},
});
