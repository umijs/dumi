import { defineConfig } from 'father';

export default defineConfig({
  cjs: { output: 'dist' },
  prebundle: {
    deps: {
      '@vue/babel-plugin-jsx': { dts: false },
    },
  },
});
