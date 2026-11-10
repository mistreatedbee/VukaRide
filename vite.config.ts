import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Read the variable names from .env.example as they are (NEXT_PUBLIC_*), as well as Vite's own VITE_*.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'api/**/*.test.ts'] },
})
