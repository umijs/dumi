import { useSiteData } from 'dumi';
import { AtomComponentAsset } from 'dumi-assets-types';

export const useAtomAssets = (): {
  components: Record<string, AtomComponentAsset>;
} => {
  const { components } = useSiteData();

  return { components };
};
