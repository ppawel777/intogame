import ViteRequireContext from '@originjs/vite-plugin-require-context'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import mkcert from 'vite-plugin-mkcert'

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
   plugins: [react(), eslint(), ViteRequireContext(), mkcert()],
   server: {
      https: {},
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
