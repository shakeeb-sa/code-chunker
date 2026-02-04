import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use '/' locally, and '/code-chunker/' only when deploying to GitHub
  base: process.env.NODE_ENV === 'production' ? '/code-chunker/' : '/',
})