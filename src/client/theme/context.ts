import { createContext, type ComponentType } from 'react';

export interface IThemeContext {
  demos: Record<string, { component: ComponentType }>;
}

export const Context = createContext<IThemeContext>({ demos: {} });
