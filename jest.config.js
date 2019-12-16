module.exports = {
  testPathIgnorePatterns: ['/packages/father-doc/lib/', '/packages/umi-plugin-father-doc/lib/'],
  collectCoverageFrom: ['packages/**/src/**/*.{js,jsx,ts,tsx}', '!**/fixtures/**'],
};
