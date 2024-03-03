import type * as BabelCore from '@umijs/bundler-utils/compiled/@babel/core';
export * from './dist/techStacks/utils';
export { BabelCore };
export const babelCore: () => typeof import('@umijs/bundler-utils/compiled/@babel/core');
export const babelPresetTypeScript: () => BabelCore.PluginItem;
export const babelPresetEnv: () => BabelCore.PluginItem;
