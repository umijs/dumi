import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    sequence: {
      hooks: 'parallel',
    },
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    globals: true,
    testTimeout: 15000,
    alias: {
      '@': path.join(__dirname, 'src'),
    },
    poolMatchGlobs: [['**/__tests__/**/*.fork.test.*', 'forks']],
  },
});
