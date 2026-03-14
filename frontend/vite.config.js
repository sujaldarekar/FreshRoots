import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const chunkGroups = {
  vendor: ['react', 'react-dom', 'react-router-dom'],
  redux: ['@reduxjs/toolkit', 'react-redux'],
  charts: ['recharts'],
  animations: ['framer-motion'],
};

const manualChunks = (id) => {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  for (const [chunkName, packages] of Object.entries(chunkGroups)) {
    if (packages.some((packageName) => id.includes(`/node_modules/${packageName}/`) || id.includes(`\\node_modules\\${packageName}\\`))) {
      return chunkName;
    }
  }

  return 'vendor';
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
});
