import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_API_URL is used at runtime by the Axios client.
// For local dev, the proxy below forwards /api/* to the backend
// so you don't need CORS configured when developing locally.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
