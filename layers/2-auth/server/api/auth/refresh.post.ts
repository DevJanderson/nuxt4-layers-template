/**
 * POST /api/auth/refresh
 * Renova tokens usando o refresh token do cookie.
 *
 * TODO: substituir mock pela chamada real à API externa
 */
export default defineEventHandler(async (event) => {
  const refreshToken = getRefreshToken(event)

  if (!refreshToken) {
    throw createError({ statusCode: 401, statusMessage: 'Refresh token ausente' })
  }

  // TODO: chamar API externa para renovar tokens
  // const response = await $fetch(`${config.apiExternalBaseUrl}/auth/refresh`, {
  //   method: 'POST',
  //   body: { refreshToken },
  //   signal: AbortSignal.timeout(15_000),
  // })

  // Mock — substituir por resposta real
  const mockTokens = {
    accessToken: 'mock-new-access-token',
    refreshToken: 'mock-new-refresh-token',
  }

  setTokenCookies(event, mockTokens)

  return {
    user: {
      id: '1',
      email: 'usuario@example.com',
      name: 'Usuário Exemplo',
    },
  }
})
