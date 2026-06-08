export { Root as HastRoot } from 'hast';
export * from 'umi';
export {
  Plugin as UnifiedPlugin,
  Transformer as UnifiedTransformer,
} from 'unified';
export type {
  IApi,
  IDumiConfig,
  IDumiTechStack,
  IDumiTechStackOnBlockLoadArgs,
  IDumiTechStackOnBlockLoadResult,
  IDumiTechStackRuntimeOpts,
  IDumiUserConfig,
} from './dumi-types';
export * from './theme-api';

export declare let unistUtilVisit: typeof import('unist-util-visit');
export declare const getProjectRoot: (cwd: string) => string;
export declare const defineConfig: <
  T extends import('./dumi-types').IDumiUserConfig,
>(
  config: T,
) => T;
