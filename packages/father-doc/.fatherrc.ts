export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  extraBabelPlugins: ['@babel/plugin-proposal-optional-chaining'],
};
