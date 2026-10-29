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
    alias: [
      { find: '@', replacement: path.join(__dirname, 'src') },
      // Resolve the package before jsdom's import analysis applies vi.mock.
      { find: /^dumi$/, replacement: path.join(__dirname, 'src/index.ts') },
    ],
    poolMatchGlobs: [['**/__tests__/**/*.fork.test.*', 'forks']],
  },
});
