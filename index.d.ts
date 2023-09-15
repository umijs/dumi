export { Root as HastRoot } from 'hast';
export * from 'umi';
export {
  Plugin as UnifiedPlugin,
  Transformer as UnifiedTransformer,
} from 'unified';
export * from './dist';
// override umi exported defineConfig
export { defineConfig } from './dist';
export * from './dist/client/theme-api';
export { IApi } from './dist/types';
export function getRouteMetaById(id: string): Promise<any>;
/** @private Internal usage. Safe to remove */
export function loadFilesMeta(): Promise<any>;
