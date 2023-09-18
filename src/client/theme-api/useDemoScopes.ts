import { getDemoScopesById } from 'dumi';
import use from './context/use';

const cache = new Map<string, ReturnType<typeof getDemoScopesById>>();

export const useDemoScopes = (id: string) => {
  if (!cache.has(id)) {
    cache.set(id, getDemoScopesById(id));
  }

  return use<ReturnType<typeof getDemoScopesById>>(cache.get(id)!);
};
