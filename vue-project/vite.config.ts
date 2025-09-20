import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,
    allowedHosts: [ "serviceconnect.uk", "www.serviceconnect.uk"]
  },
  preview: {
    port: 4173,
    host: true,  // Allow external connections
    allowedHosts: ["serviceconnect.uk", "www.serviceconnect.uk"]
  }
})
