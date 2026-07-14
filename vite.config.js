import { defineConfig } from 'vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/part.ai/', // ← название твоего репозитория
});

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});