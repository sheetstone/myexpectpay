import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      // Firebase signInWithPopup needs to call window.closed on the auth popup.
      // 'same-origin' (Chrome's default in some contexts) blocks that call.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
