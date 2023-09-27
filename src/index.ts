import type { IDumiTechStack, IDumiUserConfig } from '@/types';

let unistUtilVisit: typeof import('unist-util-visit');

// workaround to export pure esm package in cjs
(async () => {
  unistUtilVisit = await import('unist-util-visit');
})();

export * from 'umi';
export { unistUtilVisit, IDumiTechStack };
export const defineConfig = (config: IDumiUserConfig) => config;
