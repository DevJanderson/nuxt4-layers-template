import { test, expect } from '@playwright/test'
import { waitForHydration } from './helpers'

const MISSING_ROUTE = '/rota-que-nao-existe-12345'

test.describe('404', () => {
  test('retorna status 404 em rota inexistente', async ({ page }) => {
    const response = await page.goto(MISSING_ROUTE)
    expect(response?.status()).toBe(404)
  })

  test('renderiza página de erro', async ({ page }) => {
    await page.goto(MISSING_ROUTE)
    await waitForHydration(page)
    await expect(page.getByRole('heading')).toBeVisible()
  })
})
