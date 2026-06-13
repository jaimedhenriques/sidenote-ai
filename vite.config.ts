import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 4397, host: '127.0.0.1' },
  preview: { port: 4398, host: '127.0.0.1' },
});
