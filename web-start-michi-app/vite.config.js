import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/maplibre-gl/') || id.includes('node_modules/leaflet/') || id.includes('node_modules/react-map-gl/')) {
            return 'vendor-maps';
          }
          if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) {
            return 'vendor-i18n';
          }
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    allowedHosts: true
  },
  optimizeDeps: {
    exclude: ['maplibre-gl']
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'logo.png', 'logo.webp', 'truck.png', 'truck.webp', 'school.png', 'school.webp'],
      manifest: {
        id: 'michi-web-app',
        name: 'Michi App — Drive Your Career in Japan',
        short_name: 'Michi',
        description: 'Michi app for Japan — Find driver jobs, get certified at driving academies, and access dedicated truck navigation.',
        start_url: '/',
        scope: '/',
        theme_color: '#0A84FF',
        background_color: '#07090E',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui', 'browser'],
        orientation: 'any',
        categories: ['business', 'navigation', 'education', 'utilities'],
        shortcuts: [
          {
            name: 'Driver Jobs',
            short_name: 'Jobs',
            description: 'Search truck and delivery driver jobs in Japan',
            url: '/jobs',
            icons: [{ src: 'logo.png', sizes: '512x512' }]
          },
          {
            name: 'Driving Academies',
            short_name: 'Academy',
            description: 'Find driving schools and get licensed in Japan',
            url: '/academy',
            icons: [{ src: 'school.png', sizes: '920x920' }]
          },
          {
            name: 'Truck Navigation',
            short_name: 'Navi',
            description: 'Open JDM Truck GPS Navigation',
            url: '/navigation',
            icons: [{ src: 'truck.png', sizes: '835x835' }]
          }
        ],
        screenshots: [
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Michi App Desktop'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Michi App Mobile'
          }
        ],
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
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
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
