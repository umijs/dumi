import type { IDumiUserConfig } from '@/types';

let unistUtilVisit: typeof import('unist-util-visit');

// workaround to export pure esm package in cjs
(async () => {
  unistUtilVisit = await import('unist-util-visit');
})();

export * from 'umi';
export { unistUtilVisit };
export const defineConfig = (config: IDumiUserConfig) => {
  // delete the mfsu prop from config to use default mfsu config when pass ture
  if (config.mfsu === true) {
    delete config.mfsu;
  }
  return config;
};
