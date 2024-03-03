module.exports = {
  babelCore: () => require('@umijs/bundler-utils/compiled/babel/core'),
  babelPresetTypeScript: () =>
    require('@umijs/bundler-utils/compiled/babel/preset-typescript'),
  babelPresetEnv: () =>
    require('@umijs/bundler-utils/compiled/babel/preset-env'),
};
