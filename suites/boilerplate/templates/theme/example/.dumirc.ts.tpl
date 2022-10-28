import { defineConfig } from 'dumi';

export default defineConfig({
  // disable mfsu for HMR
  mfsu: false,
  // pass theme config
  themeConfig: {
    hello: 'world',
  },
});
