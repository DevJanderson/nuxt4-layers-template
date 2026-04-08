/**
 * POST /api/auth/logout
 *
 * Realiza logout: notifica a API e limpa os cookies.
 */

import { AuthMessages } from '#shared/domain/errors'

export default defineEventHandler(async event => {
  const accessToken = getAccessToken(event)

  // Tentar notificar a API (não bloqueia se falhar)
  if (accessToken) {
    try {
      const client = createApiClient(accessToken)
      await $fetch(`${client.baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: client.headers,
        body: { refresh_token: getRefreshToken(event) ?? '' },
        timeout: client.timeout
      })
    } catch (error) {
      // Log seguro - não bloqueia logout local
      logAuthError('Erro ao notificar logout na API', error)
    }
  }

  // Limpar cookies de autenticação (sempre executa)
  clearAuthCookies(event)

  return { success: true, message: AuthMessages.LOGOUT_SUCCESS }
})
