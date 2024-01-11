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
    dts: true,
    treeshake: true,
    minify: true,
  },
]);
