import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';


const externals = ['vue'];

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'index',
      fileName: 'index',
    },
    rollupOptions: {
      external: [...externals],
      output: {
        globals: {
          'vue': 'Vue',
        },
      },
    },
    outDir: 'dist',
  },
  resolve: {
    dedupe: ['vue'],
  },
  optimizeDeps: {
    include: [...externals],
  },
});
