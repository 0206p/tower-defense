import { defineConfig } from 'vite';

export default defineConfig({
  base: '/tower-defense/',
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0
  }
});

