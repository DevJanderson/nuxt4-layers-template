import { test, expect } from '@playwright/test'

test.describe('404', () => {
  test('retorna status 404 em rota inexistente', async ({ page }) => {
    const response = await page.goto('/rota-que-nao-existe-12345')
    expect(response?.status()).toBe(404)
  })

  test('renderiza página de erro', async ({ page }) => {
    await page.goto('/rota-que-nao-existe-12345')
    const body = page.locator('body')
    await expect(body).toBeVisible()
    const content = await body.textContent()
    expect(content?.length ?? 0).toBeGreaterThan(0)
  })
})
