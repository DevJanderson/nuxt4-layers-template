import { test, expect } from '@playwright/test'
import { waitForHydration } from './helpers'

test.describe('SEO meta tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForHydration(page)
  })

  // og:description e twitter:description sao omitidos quando
  // siteDescription (NUXT_PUBLIC_SITE_DESCRIPTION) esta vazio.
  test('tem meta tags Open Graph', async ({ page }) => {
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:locale"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(1)
  })

  test('tem link canonical', async ({ page }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  })

  test('html lang é pt-BR por default', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('pt-BR')
  })

  test('og:locale está no formato com underscore', async ({ page }) => {
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('pt_BR')
  })
})
