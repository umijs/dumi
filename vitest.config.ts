import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    alias: {
      '@': path.join(__dirname, 'src'),
    },
    poolMatchGlobs: [['**/__tests__/**/*.fork.test.*', 'child_process']],
  },
});
