import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // Serves the production build (run `npm run build` first).
  webServer: { command: 'node scripts/serve-dist.mjs', url: 'http://localhost:4173', reuseExistingServer: true },
})
