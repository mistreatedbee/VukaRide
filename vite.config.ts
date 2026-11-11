import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Until a real domain is set, use the project's own production address on Vercel for canonical links and the sitemap.
// Setting NEXT_PUBLIC_SITE_URL in the Vercel project settings (or .env.production) always wins.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
if (vercelHost && !process.env.NEXT_PUBLIC_SITE_URL && !process.env.VITE_SITE_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = `https://${vercelHost}`
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Read the variable names from .env.example as they are (NEXT_PUBLIC_*), as well as Vite's own VITE_*.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'api/**/*.test.ts'] },
})
