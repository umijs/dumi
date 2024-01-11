declare module '@babel/plugin-transform-typescript';
declare module '@babel/plugin-transform-modules-commonjs';

declare namespace Babel {
  export const transform: typeof import('@babel/core').transformSync;
  export function registerPlugin(
    name: string,
    plugin: import('@babel/core').PluginItem,
  ): void;
}
