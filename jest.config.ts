import '@jest/types';
import { createConfig } from '@umijs/test';
import { lodash } from 'umi/plugin-utils';

export default lodash.merge(createConfig(), {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
});
