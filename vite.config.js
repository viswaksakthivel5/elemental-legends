import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base path ensures game runs seamlessly on itch.io, GitHub Pages, or any subpath
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
