import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

/**
 * Vitest Configuration - Nuxt 4 Pattern
 *
 * Estrutura de testes:
 * - tests/unit/    → Ambiente Node (rápido) - funções puras, utils
 * - tests/nuxt/    → Ambiente Nuxt (completo) - composables, componentes, stores
 * - tests/e2e/     → Playwright (separado)
 *
 * @see https://nuxt.com/docs/4.x/getting-started/testing
 */
export default defineConfig({
  test: {
    projects: [
      // Testes unitários puros (Node environment - rápido)
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
          globals: true
        }
      },
      // Testes que precisam do runtime Nuxt (mais lento)
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.test.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom'
            }
          },
          globals: true,
          setupFiles: ['./tests/setup.ts']
        }
      })
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '.nuxt/',
        '.output/',
        'coverage/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
})
