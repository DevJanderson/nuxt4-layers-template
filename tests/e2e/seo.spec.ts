import { test, expect } from '@playwright/test'

test.describe('SEO meta tags', () => {
  test('tem meta tags Open Graph', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:locale"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(1)
  })

  test('tem link canonical', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  })

  test('html lang é pt-BR por default', async ({ page }) => {
    await page.goto('/')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('pt-BR')
  })

  test('og:locale está no formato com underscore', async ({ page }) => {
    await page.goto('/')
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('pt_BR')
  })
})
