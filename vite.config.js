import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/assets': {
        target: 'https://back-end-whatsapp-pro-6xnx.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
