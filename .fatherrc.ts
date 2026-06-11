import { defineConfig } from 'father';

process.env.FATHER_TSCONFIG_NAME =
  process.env.FATHER_TSCONFIG_NAME || 'tsconfig.father.json';

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
  dts: {
    compiler: 'tsgo',
  },
  prebundle: {
    deps: {
      // pre-bundle analytics for reduce install size
      // because @umijs/plugins depends on a lot of 3rd-party deps
      '@umijs/plugins/dist/analytics': { dts: false },
    },
  },
});
