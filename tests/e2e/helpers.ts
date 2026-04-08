import type { Page } from '@playwright/test'

/**
 * Aguarda hidratação completa do Vue/Nuxt antes de interagir com o DOM.
 *
 * Usa `networkidle` como sinal principal (garante que todo JS foi carregado
 * e executado). Tenta verificar `__vue_app__` como confirmação adicional,
 * mas aceita `networkidle` como suficiente em engines onde a propriedade
 * não é acessível (ex: WebKit em builds fallback do Playwright).
 */
export async function waitForHydration(page: Page) {
  await page.waitForLoadState('networkidle')
  await page
    .waitForFunction(
      () => {
        const el = document.querySelector('#__nuxt')
        return el && '__vue_app__' in el
      },
      { timeout: 5000 }
    )
    .catch(() => {
      // WebKit fallback: networkidle já garante que o JS foi executado
    })
}

/**
 * Intercepta chamada a rota da API e retorna fixture.
 * Uso: `await mockApi(page, 'users', usersListFixture)`
 */
export async function mockApi(page: Page, route: string, fixture: unknown) {
  await page.route(`**/api/${route}**`, r =>
    r.fulfill({ contentType: 'application/json', body: JSON.stringify(fixture) })
  )
}

/**
 * Intercepta chamada e retorna erro.
 * Uso: `await mockApiError(page, 'users', 500)`
 */
export async function mockApiError(page: Page, route: string, status = 500) {
  await page.route(`**/api/${route}**`, r =>
    r.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal Server Error' })
    })
  )
}
