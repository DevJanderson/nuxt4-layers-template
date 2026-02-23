import type { H3Event } from 'h3'

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
}

/**
 * Lê o access token do cookie httpOnly.
 */
export function getAccessToken(event: H3Event): string | undefined {
  return getCookie(event, 'access_token')
}

/**
 * Lê o refresh token do cookie httpOnly.
 */
export function getRefreshToken(event: H3Event): string | undefined {
  return getCookie(event, 'refresh_token')
}

/**
 * Grava tokens em cookies httpOnly.
 */
export function setTokenCookies(
  event: H3Event,
  tokens: { accessToken: string; refreshToken: string },
) {
  setCookie(event, 'access_token', tokens.accessToken, {
    ...TOKEN_COOKIE_OPTIONS,
    maxAge: 60 * 15, // 15 minutos
  })

  setCookie(event, 'refresh_token', tokens.refreshToken, {
    ...TOKEN_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  })
}

/**
 * Remove tokens dos cookies.
 */
export function clearTokenCookies(event: H3Event) {
  deleteCookie(event, 'access_token', { path: '/' })
  deleteCookie(event, 'refresh_token', { path: '/' })
}

/**
 * Fetch autenticado para API externa com guard de auth e timeout.
 * Padrões BFF:
 * - Rejeita sem token → 401
 * - Timeout de 15s
 * - Error sanitization (nunca repassa err.data?.detail)
 */
export async function authFetch<T>(
  event: H3Event,
  url: string,
  options?: RequestInit,
): Promise<T> {
  const token = getAccessToken(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const config = useRuntimeConfig()
  const baseUrl = config.apiExternalBaseUrl || 'http://localhost:8000'

  try {
    return await $fetch<T>(`${baseUrl}${url}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
      signal: AbortSignal.timeout(15_000),
    })
  } catch (err: unknown) {
    // Error sanitization — nunca repassar detalhes da API externa
    const status = (err as { statusCode?: number }).statusCode || 500
    throw createError({
      statusCode: status,
      statusMessage: status === 401 ? 'Não autenticado' : 'Erro interno',
    })
  }
}
