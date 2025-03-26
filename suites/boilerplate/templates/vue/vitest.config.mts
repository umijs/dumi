import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';


export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  test: {
    environment: 'happy-dom',
    include: ['./**/*.test.{ts,js,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text', 'json'],
    },
  },
});
