import { defineConfig } from 'vite';
import * as path from 'path';
import solidPlugin from 'vite-plugin-solid';
import dynamicImport from 'vite-plugin-dynamic-import';
// import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [
    dynamicImport({
      filter(id) {
        // `node_modules` is exclude by default, so we need to include it explicitly
        // https://github.com/vite-plugin/vite-plugin-dynamic-import/blob/v1.3.0/src/index.ts#L133-L135
        if (id.includes('/node_modules/@suid')) {
          return true
        }
      }
    }),
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin(),
  ],
  resolve: {
    alias: {
      '@icons':path.resolve(__dirname, './node_modules/@suid/icons-material/'),
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
