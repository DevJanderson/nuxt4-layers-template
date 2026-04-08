import { test as setup, expect } from '@playwright/test'

const authFile = 'tests/e2e/.auth/user.json'

setup('login e salvar sessao', async ({ page }) => {
  await page.goto('/auth/login')
  await page.locator('input#username').fill(process.env.PLAYWRIGHT_TEST_USER!)
  await page.locator('input#password').fill(process.env.PLAYWRIGHT_TEST_PASSWORD!)
  await page.locator('button[type="submit"]').click()

  // aguarda redirect para home autenticada
  await expect(page).toHaveURL('/', { timeout: 10000 })

  // salva cookies (incluindo httpOnly access_token e refresh_token)
  await page.context().storageState({ path: authFile })
})
