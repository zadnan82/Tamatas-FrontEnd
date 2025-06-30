import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/cv-ai': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // New configuration for handling locales
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Include JSON files as assets
    assetsInclude: ['**/*.json'],
    rollupOptions: {
      output: {
        // Preserve folder structure for assets
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  // Base path configuration - IMPORTANT: changed from './' to '/'
  base: '/',
  // Resolve alias for easier imports (optional)
  resolve: {
    alias: {
      '@locales': resolve(__dirname, 'locales')
    }
  }
});