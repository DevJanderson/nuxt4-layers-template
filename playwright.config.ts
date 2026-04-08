import { defineConfig, devices } from '@playwright/test'

/** Resolucao da tela do dev */
const SCREEN = { width: 1920, height: 1200 }

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    viewport: SCREEN,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: SCREEN }
    },

    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'], viewport: SCREEN }
    },

    {
      name: 'Laptop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 }
      }
    },

    {
      name: 'Tablet',
      use: { ...devices['iPad Pro 11'] }
    },

    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },

    ...(process.env.CI
      ? [
          {
            name: 'Desktop Safari',
            use: { ...devices['Desktop Safari'] }
          },
          {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] }
          }
        ]
      : [])
  ],

  webServer: {
    command: process.env.CI ? 'pnpm preview' : 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
