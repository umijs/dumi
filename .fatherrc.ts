import { defineConfig } from 'father';

export default defineConfig({
  cjs: {
    output: 'dist',
    ignores: ['src/client/**'],
  },
  esm: {
    input: 'src/client',
    output: 'dist/client',
    ignores: ['src/client/theme-default'],
    overrides: {
      'src/client/theme-default': {
        output: 'theme-default',
      },
    },
  },
});
