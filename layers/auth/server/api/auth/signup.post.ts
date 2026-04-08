/**
 * POST /api/auth/signup
 *
 * Cadastro público de usuário (signup).
 * Não requer autenticação.
 */

import { AuthErrors } from '#shared/domain/errors'
import { signupRequestSchema } from '../../../app/types/schemas'

export default defineEventHandler(async event => {
  const data = await validateBody(event, signupRequestSchema)

  try {
    const client = createApiClient()
    const result = await $fetch(`${client.baseUrl}/api/v1/usuarios/signup`, {
      method: 'POST',
      headers: client.headers,
      body: data,
      timeout: client.timeout
    })

    return result
  } catch (error: unknown) {
    logAuthError(AuthErrors.SIGNUP_FAILED, error)
    throw createError({ statusCode: 500, message: AuthErrors.SIGNUP_FAILED })
  }
})
