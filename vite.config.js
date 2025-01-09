import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { baseURL } from './src/globals/globals';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  base: baseURL,
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
});
