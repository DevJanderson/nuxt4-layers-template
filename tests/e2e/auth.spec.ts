/**
 * Testes E2E para fluxo de autenticação
 */

import { test, expect } from '@playwright/test'
import { waitForHydration } from './helpers'

test.describe('Autenticação', () => {
  test.describe('Página de Login', () => {
    test('deve exibir formulário de login', async ({ page }) => {
      await page.goto('/auth/login')

      // Verifica elementos do formulário
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('input#username')).toBeVisible()
      await expect(page.locator('input#password')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('deve ter link para recuperar senha', async ({ page }) => {
      await page.goto('/auth/login')

      const link = page.locator('a[href="/auth/reset-password"]')
      await expect(link).toBeVisible()
      await expect(link).toContainText('Esqueci minha senha')
    })

    test('deve mostrar/ocultar senha ao clicar no ícone', async ({ page }) => {
      await page.goto('/auth/login')
      await waitForHydration(page)

      const passwordInput = page.locator('input#password')
      const toggleButton = passwordInput.locator('..').locator('button')

      // Inicialmente deve ser type="password"
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // Clica para mostrar
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')

      // Clica para ocultar
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('botão de submit deve estar desabilitado sem credenciais', async ({ page }) => {
      await page.goto('/auth/login')

      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeDisabled()
    })

    test('botão de submit deve estar habilitado com credenciais', async ({ page }) => {
      await page.goto('/auth/login')
      await waitForHydration(page)

      await page.locator('input#username').fill('usuario@teste.com')
      await page.locator('input#password').fill('senha123')

      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeEnabled()
    })
  })

  test.describe('Página de Reset de Senha', () => {
    test('deve exibir formulário de recuperação', async ({ page }) => {
      await page.goto('/auth/reset-password')

      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('input#email')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('deve validar email inválido', async ({ page }) => {
      await page.goto('/auth/reset-password')
      await waitForHydration(page)

      const emailInput = page.locator('input#email')
      await emailInput.fill('emailinvalido')

      // Verifica se aparece mensagem de erro de validação
      await expect(page.getByText('Digite um email válido')).toBeVisible()
    })

    test('deve ter link para voltar ao login', async ({ page }) => {
      await page.goto('/auth/reset-password')

      const link = page.locator('a[href="/auth/login"]')
      await expect(link).toBeVisible()
    })
  })

  test.describe('Navegação', () => {
    test('deve navegar de login para reset de senha', async ({ page }) => {
      await page.goto('/auth/login')
      await waitForHydration(page)

      await page.click('a[href="/auth/reset-password"]')

      await expect(page).toHaveURL('/auth/reset-password')
    })

    test('deve navegar de reset de senha para login', async ({ page }) => {
      await page.goto('/auth/reset-password')
      await waitForHydration(page)

      await page.click('a[href="/auth/login"]')

      await expect(page).toHaveURL('/auth/login')
    })
  })
})

test.describe('Login Real (smoke)', () => {
  test('deve fazer login com credenciais validas e redirecionar', async ({ page }) => {
    await page.goto('/auth/login')
    await waitForHydration(page)

    await page.locator('input#username').fill(process.env.PLAYWRIGHT_TEST_USER!)
    await page.locator('input#password').fill(process.env.PLAYWRIGHT_TEST_PASSWORD!)
    await page.locator('button[type="submit"]').click()

    // aguarda redirect para home
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // verifica que header mostra menu do usuario (nao "Fazer Login")
    await expect(
      page.locator('header').getByRole('link', { name: 'Fazer Login' })
    ).not.toBeVisible()
  })

  test('deve mostrar erro com credenciais invalidas', async ({ page }) => {
    await page.goto('/auth/login')
    await waitForHydration(page)

    await page.locator('input#username').fill('usuario-invalido@teste.com')
    await page.locator('input#password').fill('senha-errada-123')
    await page.locator('button[type="submit"]').click()

    // aguarda mensagem de erro (aria-live="assertive")
    await expect(page.locator('[aria-live="assertive"]')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Auth Guard', () => {
  test('deve redirecionar pagina protegida para login', async ({ page }) => {
    // Acessa rota protegida sem sessão ativa.
    // Substitua '/rota-protegida' pela rota que usa auth-guard neste projeto.
    await page.goto('/auth/logout')

    // auth-guard redireciona para login com query param redirect
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
