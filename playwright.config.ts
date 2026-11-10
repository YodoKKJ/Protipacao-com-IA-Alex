import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:3107'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run start',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
    env: { PORT: '3107', DATABASE_PATH: ':memory:' },
  },
})
