import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Change to '/repo-name/' for GitHub Pages if needed
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
