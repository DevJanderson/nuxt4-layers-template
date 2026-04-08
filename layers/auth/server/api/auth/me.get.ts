/**
 * GET /api/auth/me
 *
 * Retorna os dados do usuário autenticado.
 * Usado para inicializar o estado de autenticação no cliente.
 */

export default defineEventHandler(async event => {
  // Tentar renovar tokens se necessário (lógica centralizada)
  const refreshResult = await tryRefreshTokens(event)

  if (!refreshResult.success) {
    return { user: null }
  }

  if (!refreshResult.accessToken) {
    return { user: null }
  }

  try {
    const client = createApiClient(refreshResult.accessToken)
    const user = await $fetch(`${client.baseUrl}/api/v1/usuarios/me`, {
      headers: client.headers,
      timeout: client.timeout
    })

    return { user }
  } catch (error: unknown) {
    if (error !== null && typeof error === 'object' && 'statusCode' in error) {
      const status = (error as { statusCode: number }).statusCode
      if (status === 401) clearAuthCookies(event)
    }
    logAuthError('Erro ao buscar dados do usuário', error)
    return { user: null }
  }
})
