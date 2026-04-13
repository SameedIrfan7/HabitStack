import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-32.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'HabitStack',
        short_name: 'HabitStack',
        description: 'No Days Off. Track habits with your crew.',
        theme_color: '#ff5000',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i, handler: 'NetworkFirst', options: { cacheName: 'supabase-cache', expiration: { maxEntries: 50, maxAgeSeconds: 86400 } } },
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, handler: 'StaleWhileRevalidate', options: { cacheName: 'google-fonts' } },
        ],
      },
    }),
  ],
})
