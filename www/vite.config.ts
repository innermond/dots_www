import { defineConfig } from 'vite';
import * as path from 'path';
import solidPlugin from 'vite-plugin-solid';
// import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [
    // devtools(),
    solidPlugin(),
  ],
  resolve: {
    alias: {
      '@icons':path.resolve(__dirname, '/node_modules/@suid/icons-material/'),
      '@': path.resolve(__dirname, './src/'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
