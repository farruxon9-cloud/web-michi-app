import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

/**
 * Admin panel build (admin.michi.jp.net). Separate from the user app on purpose:
 * admin code never ships inside the user web/mobile bundle.
 *   npm run dev:admin    → http://127.0.0.1:5174
 *   npm run build:admin  → dist-admin/
 */
const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: r('./admin'),
  base: '/',
  publicDir: false,
  plugins: [react()],
  // index.html lives in ./admin but the code lives in ./src (dev server needs this mapping)
  resolve: { alias: [{ find: /^\/src\//, replacement: `${r('./src')}/` }] },
  build: {
    outDir: r('./dist-admin'),
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: { compress: { drop_debugger: true, pure_funcs: ['console.log', 'console.info', 'console.debug'] } },
  },
  server: {
    port: 5174,
    strictPort: true,
    fs: { allow: [r('./')] },
    proxy: {
      // same-origin /api like production (nginx proxies admin.michi.jp.net/api → backend)
      '/api': { target: 'https://api.michi.jp.net', changeOrigin: true, secure: true },
    },
  },
});
