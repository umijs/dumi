import type {
  AtomAssetsParser,
  AtomAssetsParserResult,
  IDumiOnBlockLoadArgs,
  IDumiOnBlockLoadResult,
  IDumiTechStack,
  IDumiUserConfig,
} from '@/types';
let unistUtilVisit: typeof import('unist-util-visit');

// workaround to export pure esm package in cjs
(async () => {
  unistUtilVisit = await import('unist-util-visit');
})();

export * from 'umi';
export * from './assetParsers/BaseParser';
export * from './assetParsers/utils';
export { getProjectRoot } from './utils';
export {
  unistUtilVisit,
  IDumiTechStack,
  IDumiOnBlockLoadArgs,
  IDumiOnBlockLoadResult,
  AtomAssetsParser,
  AtomAssetsParserResult,
};
export const defineConfig = (config: IDumiUserConfig) => config;
