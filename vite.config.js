import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: (process.env.VERCEL || process.env.NETLIFY || process.env.CF_PAGES) ? '/' : '/michiappforjapan/',
  plugins: [react()],
})
