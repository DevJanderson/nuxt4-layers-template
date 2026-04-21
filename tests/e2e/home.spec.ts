import { test, expect } from '@playwright/test'

test.describe('Home', () => {
  test('carrega a página inicial', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/)
  })

  test('renderiza o hero', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('home-hero')).toBeVisible()
  })

  test('tem color-mode aplicado no html', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    const classes = await html.getAttribute('class')
    expect(classes).toMatch(/\b(light|dark)\b/)
  })
})
