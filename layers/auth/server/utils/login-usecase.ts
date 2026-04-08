/**
 * Use Case — Login
 *
 * Função pura que encapsula a lógica de autenticação.
 * Extraída do server route para ser testável sem HTTP.
 *
 * Responsabilidades:
 * 1. Chamar API via $fetch com credenciais
 * 2. Buscar dados do usuário com o token obtido
 * 3. Retornar Result tipado (sem throw)
 */

import type { H3Event } from 'h3'
import { ok, fail } from '#shared/domain/result'
import type { Result } from '#shared/domain/result'
import { AuthErrors } from '#shared/domain/errors'
import { tokenSchema } from '../../app/types/schemas'
import type { AuthUser } from '../../app/types'

export interface LoginInput {
  username: string
  password: string
}

export interface LoginOutput {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export async function executeLogin(input: LoginInput): Promise<Result<LoginOutput>> {
  // 1. Login na API — obter tokens
  let tokenData: { access_token: string; refresh_token: string }
  try {
    const client = createApiClient()
    const response = await $fetch(`${client.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: client.headers,
      body: { username: input.username, password: input.password },
      timeout: client.timeout
    })
    const parsed = tokenSchema.safeParse(response)
    if (!parsed.success) return fail(AuthErrors.LOGIN_FAILED)
    tokenData = parsed.data
  } catch (error: unknown) {
    if (error !== null && typeof error === 'object' && 'statusCode' in error) {
      const status = (error as { statusCode: number }).statusCode
      if (status === 401 || status === 422) return fail(AuthErrors.INVALID_CREDENTIALS)
    }
    logAuthError(AuthErrors.LOGIN_FAILED, error)
    return fail(AuthErrors.LOGIN_FAILED)
  }

  // 2. Buscar dados do usuário com o token obtido
  let user: AuthUser
  try {
    const authClient = createApiClient(tokenData.access_token)
    user = await $fetch<AuthUser>(`${authClient.baseUrl}/api/v1/usuarios/me`, {
      headers: authClient.headers,
      timeout: authClient.timeout
    })
  } catch (error: unknown) {
    logAuthError(AuthErrors.FETCH_USER_FAILED, error)
    return fail(AuthErrors.FETCH_USER_FAILED)
  }

  return ok({
    user,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token
  })
}

/**
 * Adapter HTTP — converte Result do use case em resposta H3
 * Usado pelo server route para separar lógica de transporte
 */
export function handleLoginResult(event: H3Event, result: Result<LoginOutput>): { user: AuthUser } {
  if (!result.ok) {
    clearAuthCookies(event)
    const statusCode = result.error === AuthErrors.INVALID_CREDENTIALS ? 401 : 500
    throw createError({ statusCode, message: result.error })
  }

  setAuthCookies(event, result.value.accessToken, result.value.refreshToken)
  logger.info('Login bem-sucedido', {
    userId: result.value.user.id
  })

  return { user: result.value.user }
}
