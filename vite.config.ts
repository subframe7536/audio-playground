import path from 'node:path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import uno from '@unocss/vite'
import { polyfillTaglib, taglibManualChunksConfig } from 'node-taglib-sharp-extend/vite'

export default defineConfig({
  plugins: [polyfillTaglib(), uno({ inspector: false }), solid()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ...taglibManualChunksConfig,
        },
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
})
