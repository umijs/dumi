import { getDemoScopesById } from 'dumi';
import { use } from '../utils';

const cache = new Map<string, any>();

export const useDemoScopes = (id: string) => {
  if (!getDemoScopesById) {
    return null;
  }

  if (!cache.has(id)) {
    cache.set(id, getDemoScopesById(id));
  }

  return use<any>(cache.get(id)!);
};

export const isLiveEnabled = () => !!getDemoScopesById;
