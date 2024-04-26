import { defineConfig } from 'tsup';

export default defineConfig([
  {
    name: 'compiler',
    entry: {
      compiler: 'src/compiler/browser.ts',
    },
    format: 'esm',
    outDir: 'lib',
    target: 'esnext',
    platform: 'browser',
    noExternal: ['@vue/babel-plugin-jsx', 'hash-sum'],
    external: ['vue/compiler-sfc'],
    treeshake: true,
  },
  {
    name: 'renderer',
    entry: {
      renderer: 'src/vue/runtime/renderer.ts',
    },
    format: 'esm',
    outDir: 'lib',
    target: 'esnext',
    platform: 'browser',
    external: ['vue'],
    treeshake: true,
  },
  {
    name: 'preflight',
    entry: {
      preflight: 'src/vue/runtime/preflight.ts',
    },
    format: 'esm',
    outDir: 'lib',
    target: 'esnext',
    platform: 'browser',
    external: ['vue'],
    treeshake: true,
  },
  {
    name: 'previewer',
    entry: ['src/vue/runtime/runtimePlugin.ts'],
    format: 'esm',
    outDir: 'lib',
    target: 'esnext',
    platform: 'browser',
    treeshake: true,
  },
]);
