import type * as BabelCore from '@umijs/bundler-utils/compiled/@babel/core';
export {
  ILanguageMetaParser,
  IPatchFile,
} from './dist/assetParsers/BaseParser';
export {
  IBaseApiParserOptions,
  createApiParser,
} from './dist/assetParsers/utils';
export * from './dist/techStacks/utils';
export { BabelCore };
export const babelCore: () => typeof import('@umijs/bundler-utils/compiled/@babel/core');
export const babelPresetTypeScript: () => BabelCore.PluginItem;
export const babelPresetEnv: () => BabelCore.PluginItem;
