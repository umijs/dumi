module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    'import/no-unresolved': 0,
    'no-underscore-dangle': 0,
    'import/no-extraneous-dependencies': 0,
    'global-require': 0,
    'import/no-dynamic-require': 0,
    'react/sort-comp': 0,
    'jsx-a11y/aria-role': 0,
  },
};
