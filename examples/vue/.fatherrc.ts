import { defineConfig } from 'father';

export default defineConfig({
  extraBabelPresets: [
    [
      require.resolve('@umijs/bundler-utils/compiled/babel/preset-typescript'),
      { isTSX: true, allExtensions: true },
      require.resolve('../../compiled/@vue/babel-plugin-jsx'),
    ],
  ],
  esm: {
    transformer: 'babel',
  },
});
