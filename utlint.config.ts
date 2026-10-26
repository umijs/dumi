import umi from '@umijs/lint/dist/config/utlint';
import { defineConfig, globalIgnores } from '@utoo/lint/config';

export default defineConfig(
  globalIgnores([
    'dist/**',
    'compiled/**',
    'theme-default/**',
    'suites/*/compiled/**',
    'suites/preset-vue/lib/**',
    'examples/vue/**',
    'suites/dumi-vue-meta/tests/**',
  ]),
  {
    extends: [umi],
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
    },
  },
);
