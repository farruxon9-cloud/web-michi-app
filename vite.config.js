import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // '/' (not './'): with a relative base, refreshing a nested URL on the web
  // requested /some/path/assets/*.js and got index.html → white screen.
  // Capacitor serves from the WebView root, so '/' works there too.
  base: '/',
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      }
    }
  },
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://api.michi.jp.net',
        changeOrigin: true,
        secure: true
      }
    }
  },
  optimizeDeps: {
    exclude: ['maplibre-gl']
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Michi App',
        short_name: 'Michi',
        description: 'Michi app for Japan - Driver and driving academy database platform',
        theme_color: '#5E5CE6',
        background_color: '#1C1C1E',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          {
            // OpenFreeMap vector tiles / styles / fonts (free, OSM data). Tiles change rarely.
            urlPattern: /^https:\/\/tiles\.openfreemap\.org\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'openfreemap-cache',
              expiration: { maxEntries: 600, maxAgeSeconds: 14 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ]
})
