import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const isAgent = !!(
  process.env.CLAUDE_CODE ||
  process.env.CURSOR_SESSION_ID ||
  process.env.DEVIN ||
  process.env.VITEST_AGENT_REPORTER
)
const agentReporter = isAgent ? ['./tests/agent-reporter.ts'] : []

const coverageOptions = {
  provider: 'v8' as const,
  reporter: ['text', 'json', 'html'],
  reportsDirectory: './coverage',
  include: [
    'layers/**/app/utils/**/*.ts',
    'layers/**/app/composables/**/*.ts',
    'layers/**/server/**/*.ts',
    'layers/**/shared/**/*.ts',
    'layers/**/app/middleware/**/*.ts',
    'layers/**/app/plugins/**/*.ts'
  ],
  exclude: [
    'node_modules/',
    '.nuxt/',
    '.output/',
    'coverage/',
    'tests/',
    '**/*.vue',
    '**/*.d.ts',
    '**/*.config.*',
    '**/components/ui/**',
    '**/composables/types.ts',
    '**/shared/types/**',
    '**/server/plugins/**',
    '**/server/utils/logger.ts',
    'scripts/**'
  ],
  thresholds: {
    lines: 80,
    functions: 80
  }
}

// Projeto "unit": Node puro, sem Nuxt, sem setup.ts
const unitProject = defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('.', import.meta.url)),
      '#shared': fileURLToPath(new URL('./layers/base/shared', import.meta.url))
    }
  },
  test: {
    name: 'unit',
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
    coverage: coverageOptions
  }
})

// Projeto "nuxt": happy-dom + @nuxt/test-utils
const nuxtProject = defineVitestConfig({
  test: {
    name: 'nuxt',
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
    coverage: coverageOptions
  }
})

export default defineConfig({
  test: {
    projects: [unitProject, nuxtProject],
    coverage: coverageOptions,
    ...(agentReporter.length && { reporters: agentReporter })
  }
})
