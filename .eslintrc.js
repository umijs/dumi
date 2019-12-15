module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    // 分包不能开这个
    'import/no-unresolved': 0,
    // 这里使用了 umi 的 _开头 api
    'no-underscore-dangle': 0,
  },
};
