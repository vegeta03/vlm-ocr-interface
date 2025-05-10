// vite.config.js
const { defineConfig } = require('vite');
const path = require('path');

module.exports = defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    }
  },
  server: {
    open: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        // No need for additionalData with the new @use/@forward structure
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
