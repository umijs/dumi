import { defineConfig } from 'father';

export default defineConfig({
  cjs: {
    output: 'dist',
    ignores: ['src/client/**'],
  },
  esm: {
    input: 'src/client',
    output: 'dist/client',
  },
});
