import { defineConfig } from 'father';

export default defineConfig({
  cjs: {
    output: 'dist',
    ignores: ['src/vue/runtime/**'],
  },
  prebundle: {
    deps: {
      '@vue/babel-plugin-jsx': { dts: false },
    },
  },
});
