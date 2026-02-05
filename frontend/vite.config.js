import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // repository name is code-chunker
  base: process.env.NODE_ENV === 'production' ? '/code-chunker/' : '/',
})