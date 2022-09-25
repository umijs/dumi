import { createContext, type ComponentType } from 'react';
import type { ILocalesConfig, IPreviewerProps } from './types';

export interface IThemeContext {
  demos: Record<
    string,
    { component: ComponentType; asset: IPreviewerProps['asset'] }
  >;
  locales: ILocalesConfig;
}

export const Context = createContext<IThemeContext>({ demos: {}, locales: [] });
