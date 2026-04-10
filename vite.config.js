const { resolve } = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'website/index.html'),
        signup: resolve(__dirname, 'website/signup.html'),
        admin: resolve(__dirname, 'admin/index.html')
      }
    }
  }
});
