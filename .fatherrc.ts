import { defineConfig } from 'father';

export default defineConfig({
  cjs: {
    output: 'dist',
    ignores: ['src/client/**'],
  },
  esm: {
    input: 'src/client',
    output: 'dist/client',
    ignores: [
      'src/client/theme-default',
      'src/client/theme-api/useSiteSearch/searchWorker.ts',
    ],
    overrides: {
      'src/client/theme-default': {
        output: 'theme-default',
      },
    },
  },
  prebundle: {
    deps: {
      // pre-bundle analytics for reduce install size
      // because @umijs/plugins depends on a lot of 3rd-party deps
      '@umijs/plugins/dist/analytics': { dts: false },
    },
  },
});
