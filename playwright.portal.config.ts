import { defineConfig, devices } from '@playwright/test'

// Portal tests run against the dev server, where the portal uses its in-memory demo data (no Supabase needed).
export default defineConfig({
  testDir: 'tests-portal',
  fullyParallel: false,
  reporter: 'list',
  use: { baseURL: 'http://localhost:5174' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npx vite --port 5174 --strictPort', url: 'http://localhost:5174', reuseExistingServer: false, timeout: 60_000 },
})
