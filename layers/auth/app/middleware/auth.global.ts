/**
 * Middleware Global de Autenticação
 *
 * Inicializa o estado de autenticação no SSR e no cliente.
 * No SSR, busca dados do usuário para que o Pinia hidrate o estado
 * corretamente, evitando flash de skeleton no header.
 * No cliente, o estado já vem hidratado do SSR (via @pinia/nuxt).
 *
 * Também re-valida a sessão periodicamente durante navegação no cliente,
 * para detectar tokens expirados e acionar o redirect do plugin auth-redirect.
 */

import { TOKEN_REFRESH_MARGIN_SECONDS } from '#shared/utils/auth-constants'

const REVALIDATION_INTERVAL = TOKEN_REFRESH_MARGIN_SECONDS * 1000

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  // Primeira inicialização (SSR ou primeiro acesso no cliente)
  if (!authStore.isInitialized) {
    await authStore.fetchUser()
    return
  }

  // Client-side: re-validar sessão em background se autenticado
  // Detecta tokens expirados que o servidor já limpou
  if (import.meta.client && authStore.isAuthenticated) {
    const elapsed = Date.now() - authStore.lastFetchAt
    if (elapsed > REVALIDATION_INTERVAL) {
      // Non-blocking: não atrasa a navegação
      authStore.fetchUser()
    }
  }
})
