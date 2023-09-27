import { defineConfig } from 'father';

export default defineConfig({
  extraBabelPlugins: [
    [
      '@babel/plugin-transform-typescript',
      { isTSX: true, allExtensions: true },
    ],
    '@vue/babel-plugin-jsx',
  ],
  esm: {
    transformer: 'babel',
  },
});
