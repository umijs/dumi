import { createContext, type ComponentType } from 'react';
import type { IPreviewerProps } from './types';

export interface IThemeContext {
  demos: Record<
    string,
    { component: ComponentType; asset: IPreviewerProps['asset'] }
  >;
}

export const Context = createContext<IThemeContext>({ demos: {} });
