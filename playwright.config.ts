import { defineConfig, devices } from '@playwright/test'

/** Resolucao da tela do dev */
const SCREEN = { width: 1920, height: 1200 }

const AUTH_STATE = 'tests/e2e/.auth/user.json'

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
    // --- Setup: login real, salva storageState ---
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/
    },

    // --- Auth spec: roda SEM sessao (testa o proprio login) ---
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: SCREEN }
    },

    // --- Testes autenticados: dependem do setup ---
    {
      name: 'Desktop Chrome',
      testIgnore: /auth\.(setup|spec)\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: SCREEN, storageState: AUTH_STATE },
      dependencies: ['setup']
    },

    {
      name: 'Desktop Firefox',
      testIgnore: /auth\.(setup|spec)\.ts/,
      use: { ...devices['Desktop Firefox'], viewport: SCREEN, storageState: AUTH_STATE },
      dependencies: ['setup']
    },

    {
      name: 'Laptop Chrome',
      testIgnore: /auth\.(setup|spec)\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        storageState: AUTH_STATE
      },
      dependencies: ['setup']
    },

    {
      name: 'Tablet',
      testIgnore: /auth\.(setup|spec)\.ts/,
      use: { ...devices['iPad Pro 11'], storageState: AUTH_STATE },
      dependencies: ['setup']
    },

    {
      name: 'Mobile Chrome',
      testIgnore: /auth\.(setup|spec)\.ts/,
      use: { ...devices['Pixel 5'], storageState: AUTH_STATE },
      dependencies: ['setup']
    },

    ...(process.env.CI
      ? [
          {
            name: 'Desktop Safari',
            testIgnore: /auth\.(setup|spec)\.ts/,
            use: { ...devices['Desktop Safari'], storageState: AUTH_STATE },
            dependencies: ['setup']
          },
          {
            name: 'Mobile Safari',
            testIgnore: /auth\.(setup|spec)\.ts/,
            use: { ...devices['iPhone 12'], storageState: AUTH_STATE },
            dependencies: ['setup']
          }
        ]
      : [])
  ],

  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
