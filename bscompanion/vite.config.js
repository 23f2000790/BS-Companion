import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate source maps for production debugging
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Rollup options for better chunking and caching
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunk for libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          ui: ['framer-motion', 'gsap'],
          // Charts and visualization
          charts: ['recharts', 'chart.js'],
          // Code highlighting
          syntax: ['react-syntax-highlighter'],
        },
        // Asset file naming with content hash for cache busting
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Chunk file naming with content hash
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // CSS code splitting for better caching
    cssCodeSplit: true,
    // Asset inline threshold (4kb)
    assetsInlineLimit: 4096,
  },
  // Server configuration for dev
  server: {
    // Enable compression in dev
    compress: true,
  },
})
