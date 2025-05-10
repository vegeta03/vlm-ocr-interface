// vite.config.js
const { defineConfig } = require('vite');

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
  }
});
