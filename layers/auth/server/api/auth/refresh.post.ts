/**
 * POST /api/auth/refresh
 *
 * Renova os tokens de autenticação usando o refresh token.
 * Este endpoint pode ser chamado pelo cliente quando necessário,
 * mas o refresh automático já é feito pelo server middleware.
 */

import { AuthErrors, AuthMessages } from '#shared/domain/errors'

export default defineEventHandler(async event => {
  const refreshResult = await tryRefreshTokens(event)

  if (!refreshResult.success) {
    throw createError({
      statusCode: 401,
      message: refreshResult.error || AuthErrors.SESSION_EXPIRED
    })
  }

  return { message: AuthMessages.TOKEN_REFRESHED }
})
