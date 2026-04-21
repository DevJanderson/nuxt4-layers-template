import { test, expect } from '@playwright/test'
import { waitForHydration } from './helpers'

test.describe('Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForHydration(page)
  })

  test('carrega a página inicial', async ({ page }) => {
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title).not.toMatch(/undefined/i)
  })

  test('renderiza o hero', async ({ page }) => {
    await expect(page.getByTestId('home-hero')).toBeVisible()
  })

  test('tem color-mode aplicado no html', async ({ page }) => {
    const classes = await page.locator('html').getAttribute('class')
    expect(classes).toMatch(/\b(light|dark)\b/)
  })
})
