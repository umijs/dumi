import type { IDumiUserConfig } from '@/types';

let unistUtilVisit: typeof import('unist-util-visit');

// workaround to export pure esm package in cjs
(async () => {
  unistUtilVisit = await import('unist-util-visit');
})();

// organize-imports-ignore
export * from 'umi';
export * from './client/theme-api';
export type { IApi } from '@/types';
export type { Root as HastRoot } from 'hast';
export type {
  Plugin as UnifiedPlugin,
  Transformer as UnifiedTransformer,
} from 'unified';
export { unistUtilVisit };
export const defineConfig = (config: IDumiUserConfig) => config;
