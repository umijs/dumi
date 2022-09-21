import { createContext, type ComponentType } from 'react';
import type { IPreviewerProps } from './types';

export interface IThemeContext {
  demos: Record<
    string,
    { component: ComponentType; asset: IPreviewerProps['asset'] }
  >;
  locales: { id: string; name: string; base: string }[];
}

export const Context = createContext<IThemeContext>({ demos: {}, locales: [] });
