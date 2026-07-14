import { defineConfig } from 'vite';

export default defineConfig({
  base: '/part.ai/', // ← для GitHub Pages
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});