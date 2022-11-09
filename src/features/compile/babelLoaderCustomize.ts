import type { PartialConfig } from '@umijs/bundler-utils/compiled/@babel/core';

export default function babelLoaderCustomize() {
  return {
    config(config: PartialConfig) {
      const context = this as any;

      // make meta filename is different with source file, to avoid collect wrong deps in MFSU
      if (
        config.options.filename &&
        context.resourceQuery.includes('type=meta')
      ) {
        config.options.filename += context.resourceQuery;
      }

      return config.options;
    },
  };
}
