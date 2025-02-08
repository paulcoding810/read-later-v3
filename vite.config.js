import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import manifest from './src/manifest.js'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },

    resolve: {
      alias: [
        { find: '@', replacement: '/src' },
        { find: '@assets', replacement: 'src/assets' },
        { find: '@components', replacement: 'src/components' },
      ],
    },

    plugins: [crx({ manifest }), react()],
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        port: 5173,
      },
    },
    // https://github.com/bozzhik/snable/commit/e7603e71a19edd782e22a7a94a4b2a96f6fa34af
    legacy: {
      skipWebSocketTokenCheck: true,
    },
  }
})
