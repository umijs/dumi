import { useSiteData } from 'dumi';
import type { AtomComponentAsset } from 'dumi-assets-types';
import type { PropertySchema } from 'dumi-assets-types/typings/atom/props';

export const useAtomAssets = (): {
  components: Record<string, AtomComponentAsset>;
  references?: Record<string, PropertySchema>;
} => {
  const { components, references } = useSiteData();

  return { components, references };
};
