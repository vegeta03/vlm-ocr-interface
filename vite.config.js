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
        additionalData: `@import "./src/scss/abstracts/_variables.scss"; @import "./src/scss/abstracts/_mixins.scss"; @import "./src/scss/abstracts/_functions.scss";`
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
