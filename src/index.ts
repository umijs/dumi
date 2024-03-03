import type {
  IDumiTechStack,
  IDumiTechStackRuntimeOpts,
  IDumiUserConfig,
} from '@/types';
let unistUtilVisit: typeof import('unist-util-visit');

// workaround to export pure esm package in cjs
(async () => {
  unistUtilVisit = await import('unist-util-visit');
})();

export * from 'umi';
export { getProjectRoot } from './utils';
export { unistUtilVisit, IDumiTechStack, IDumiTechStackRuntimeOpts };
export const defineConfig = (config: IDumiUserConfig) => config;
