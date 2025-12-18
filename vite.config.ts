import path from 'node:path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import uno from '@unocss/vite'
import { polyfillTaglib, taglibAdvancedChunksConfig } from 'node-taglib-sharp-extend/vite'

export default defineConfig({
  plugins: [polyfillTaglib({ optimizeChunk: false }), uno({ inspector: false }), solid()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: taglibAdvancedChunksConfig,
        },
      },
    },
  },
})
