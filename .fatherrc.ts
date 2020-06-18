export default {
  target: 'node',
  disableTypeCheck: true,
  cjs: { type: 'babel', lazy: true },
  extraBabelPlugins: ['@babel/plugin-proposal-optional-chaining'],
};
