import fs from 'node:fs';
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
    esbuildPlugins: [
      {
        name: 'resolve-babel-plugin-jsx',
        setup(build) {
          build.onLoad({ filter: /babel-plugin-jsx.*mjs$/ }, async (args) => {
            const code = await fs.promises.readFile(args.path, 'utf-8');
            return {
              loader: 'js',
              contents: code.replace(
                'import syntaxJsx from "@babel/plugin-syntax-jsx";',
                'const syntaxJsx = require("@babel/plugin-syntax-jsx").default;',
              ),
            };
          });
        },
      },
    ],
  },
]);
