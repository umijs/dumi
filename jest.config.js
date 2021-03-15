module.exports = {
  setupFiles: ['<rootDir>/scripts/jest-setup.js'],
  coveragePathIgnorePatterns: [
    '/packages/dumi/src/index.ts',
    '/packages/create-dumi-lib/src/cli.ts',
    '/packages/create-dumi-app/src/cli.ts',
  ],
  moduleNameMapper: {
    // 确保 import {} from 'umi' 正常 work
    '^@@/dumi/config$':
      '<rootDir>/packages/preset-dumi/src/fixtures/basic/.umi-test/dumi/config.json',
    '^dumi/theme$': '<rootDir>/packages/preset-dumi/src/theme/index.ts',
    '^webpack$': '@umijs/deps/compiled/webpack/webpack.js'
  },
};
