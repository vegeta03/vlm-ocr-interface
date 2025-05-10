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
    open: false, // Prevents automatic browser opening
    port: 5173   // Sets a fixed port
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
