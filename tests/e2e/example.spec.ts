import { test, expect } from '@playwright/test'

/**
 * Example E2E Test Suite
 * Demonstra padrões de teste com Playwright
 */
test.describe('Homepage', () => {
  test('should display the homepage correctly', async ({ page }) => {
    await page.goto('/')

    // Verifica se a página carregou
    await expect(page).toHaveTitle(/Nuxt/)

    // Verifica se o conteúdo principal está visível
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Verifica se a página ainda funciona em mobile
    await expect(page).toHaveTitle(/Nuxt/)
  })
})

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/')

    // Exemplo: clica em um link e verifica navegação
    // Ajuste conforme suas rotas
    // await page.click('a[href="/example"]')
    // await expect(page).toHaveURL('/example')
  })
})

test.describe('Accessibility', () => {
  test('should have no accessibility violations on homepage', async ({
    page
  }) => {
    await page.goto('/')

    // Verifica elementos básicos de acessibilidade
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang')

    // Verifica se há um main landmark
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})
