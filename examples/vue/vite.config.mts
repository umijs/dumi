import { defineConfig } from 'vite'
import noBundlePlugin from 'vite-plugin-no-bundle'
import dts from 'vite-plugin-dts'
import vue from '@vitejs/plugin-vue'
// support class component decorator and metadata
import vueJsx from '@vue3-oop/plugin-vue-jsx'

export default defineConfig({
  build: {
    minify: false,
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    noBundlePlugin({ copy: '**/!(demos)/*.{css,less}' }),
    dts({ include: ['src'], exclude: ['src/**/demos'] }),
  ],
})
