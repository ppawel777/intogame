import ViteRequireContext from '@originjs/vite-plugin-require-context'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
   build: {
      outDir: 'build',
      // minify: 'esbuild',
      minify: 'terser',
      sourcemap: false,
      rollupOptions: {
         maxParallelFileOps: 2,
         cache: false,
         output: {
            manualChunks: (id) => {
               if (id.includes('node_modules')) {
                  return 'vendor'
               }
            },
            inlineDynamicImports: false,
         },
      },
   },
   css: {
      modules: {
         localsConvention: 'camelCase',
      },
   },
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src'),
         '@api': path.resolve(__dirname, './src/api'),
         '@components': path.resolve(__dirname, './src/components'),
         '@context': path.resolve(__dirname, './src/context'),
         '@pages': path.resolve(__dirname, './src/pages'),
         '@store': path.resolve(__dirname, './src/store'),
         '@img': path.resolve(__dirname, './src/static/img'),
         '@svg': path.resolve(__dirname, './src/static/svg'),
         '@utils': path.resolve(__dirname, './src/utils'),
         '@hooks': path.resolve(__dirname, './src/hooks'),
         '@typesDir': path.resolve(__dirname, './src/types'),
         '@supabaseDir': path.resolve(__dirname, './src/supabase'),
      },
   },
   plugins: [
      react(),
      eslint({
         exclude: ['**/node_modules/**', '**/dev-dist/**', '**/build/**', '**/*.config.js'],
      }),
      ViteRequireContext(),
      // mkcert нужен только для HTTPS в production
      ...(process.env.NODE_ENV === 'production' ? [mkcert()] : []),
      VitePWA({
         registerType: 'autoUpdate',
         includeAssets: ['favicon.ico', 'icon-192x192.png', 'icon-512x512.png'],
         manifest: {
            name: 'В игру',
            short_name: 'В игру',
            description: 'Приложение для организации и участия в играх',
            theme_color: '#61b556',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
               {
                  src: '/icon-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                  purpose: 'any maskable',
               },
               {
                  src: '/icon-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any maskable',
               },
               // Опционально: если генератор предлагает другие размеры, можно добавить:
               // {
               //    src: '/icon-180x180.png',
               //    sizes: '180x180',
               //    type: 'image/png',
               //    purpose: 'any maskable',
               // },
               // {
               //    src: '/icon-256x256.png',
               //    sizes: '256x256',
               //    type: 'image/png',
               //    purpose: 'any maskable',
               // },
            ],
         },
         workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
            runtimeCaching: [
               {
                  urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
                  handler: 'NetworkFirst',
                  options: {
                     cacheName: 'supabase-cache',
                     expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60 * 24, // 24 часа
                     },
                     cacheableResponse: {
                        statuses: [0, 200],
                     },
                  },
               },
               {
                  urlPattern: /^https:\/\/.*\/api\/.*/i,
                  handler: 'NetworkFirst',
                  options: {
                     cacheName: 'api-cache',
                     expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 5, // 5 минут
                     },
                     cacheableResponse: {
                        statuses: [0, 200],
                     },
                  },
               },
            ],
            // Добавляем обработчики push-уведомлений через отдельный скрипт
            importScripts: ['/push-handlers.js'],
         },
         devOptions: {
            enabled: true,
            type: 'module',
         },
      }),
   ],
   server: {
      // В dev режиме используем HTTP (Service Worker работает на localhost и без HTTPS)
      // В production будет HTTPS
      https: process.env.NODE_ENV === 'production' ? {} : undefined,
      proxy: {
         '/api': {
            target: 'http://backend:3000',
            changeOrigin: true,
            secure: false,
         },
      },
      open: true,
   },
})
