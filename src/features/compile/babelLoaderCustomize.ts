import type { PartialConfig } from '@umijs/bundler-utils/compiled/@babel/core';

export default function babelLoaderCustomize() {
  return {
    config(config: PartialConfig) {
      const context = this as any;

      // make meta filename is different with source file, to avoid collect wrong deps in MFSU
      if (
        config.options.filename &&
        ['type=demo', 'type=frontmatter', 'type=demo-index', 'type=text'].some(
          (v) => context.resourceQuery.includes(v),
        )
      ) {
        config.options.filename += context.resourceQuery;
      }

      return config.options;
    },
  };
}
