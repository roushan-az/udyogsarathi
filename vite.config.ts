import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Whenever React asks for /api, Vite secretly forwards it to FastAPI
      '/api': {
        target: 'http://127.0.0.1:8000', // 👈 CHANGE THIS FROM localhost
        changeOrigin: true,
        secure: false,
      }
    }
  }
})