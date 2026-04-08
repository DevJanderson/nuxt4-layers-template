/**
 * Utilitários de autenticação (server-side)
 * Helpers para manipulação de JWT e cookies
 */

import type { H3Event } from 'h3'
import { AuthErrors } from '#shared/domain/errors'

import type { Token } from '../../app/types/schemas'
import { tokenSchema } from '../../app/types/schemas'
import { TOKEN_REFRESH_MARGIN_SECONDS, REFRESH_TOKEN_MAX_AGE } from '#shared/utils/auth-constants'

// ============================================================================
// CONSTANTES
// ============================================================================

const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'
const DEFAULT_FETCH_TIMEOUT = 15000 // 15 segundos

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Token JWT decodificado (payload)
 * Usado apenas no servidor para verificar expiração
 */
interface JwtPayload {
  sub: string
  exp: number
  iat?: number
  [key: string]: unknown
}

/**
 * Erro retornado pela API externa
 */
export interface ApiError {
  statusCode: number
  statusMessage?: string
  data?: unknown
}

/**
 * Type guard para verificar se é um erro da API externa
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'statusCode' in error &&
    typeof (error as ApiError).statusCode === 'number'
  )
}

/**
 * Log de erro seguro (não expõe detalhes em produção)
 */
export function logAuthError(context: string, error: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    logger.error(`[Auth] ${context}:`, error)
  } else {
    // Em produção, log apenas contexto sem detalhes sensíveis
    logger.error(`[Auth] ${context}`)
  }
}

/**
 * Decodifica um token JWT (sem verificar assinatura)
 * A verificação é feita pela API backend
 */
export function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    if (!payload) return null

    // Decodifica base64url para base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8')

    return JSON.parse(jsonPayload) as JwtPayload
  } catch {
    return null
  }
}

/**
 * Verifica se o token está expirado ou próximo de expirar
 */
export function isTokenExpired(token: string, marginSeconds: number = 0): boolean {
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now + marginSeconds
}

/**
 * Verifica se o token precisa ser renovado (expirado ou próximo de expirar)
 */
export function shouldRefreshToken(token: string): boolean {
  return isTokenExpired(token, TOKEN_REFRESH_MARGIN_SECONDS)
}

/**
 * Obtém o access token do cookie
 */
export function getAccessToken(event: H3Event): string | null {
  return getCookie(event, ACCESS_TOKEN_COOKIE) || null
}

/**
 * Obtém o refresh token do cookie
 */
export function getRefreshToken(event: H3Event): string | null {
  return getCookie(event, REFRESH_TOKEN_COOKIE) || null
}

/**
 * Define os cookies de autenticação
 */
export function setAuthCookies(event: H3Event, accessToken: string, refreshToken: string): void {
  const isProduction = process.env.NODE_ENV === 'production'

  // Access token - vida curta
  setCookie(event, ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/'
    // Não definir maxAge - expira com a sessão do navegador
    // A API controla a expiração via JWT
  })

  // Refresh token - vida mais longa
  setCookie(event, REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE
  })
}

/**
 * Remove os cookies de autenticação
 */
export function clearAuthCookies(event: H3Event): void {
  deleteCookie(event, ACCESS_TOKEN_COOKIE, { path: '/' })
  deleteCookie(event, REFRESH_TOKEN_COOKIE, { path: '/' })
}

/**
 * Obtém a URL base da API externa
 */
export function getApiBaseUrl(): string {
  const config = useRuntimeConfig()
  const url = config.apiBaseUrl as string

  if (!url) {
    throw createError({
      statusCode: 500,
      message: AuthErrors.CONFIG_MISSING
    })
  }

  return url
}

/**
 * Cria headers de autorização para a API externa
 */
export function createAuthHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
}

// ============================================================================
// REFRESH DE TOKENS (centralizado, com dedup para requests concorrentes)
// ============================================================================

/**
 * Resultado da tentativa de refresh de tokens
 */
export interface RefreshResult {
  success: boolean
  accessToken?: string
  error?: string
}

/**
 * Cache de refresh em andamento, keyed por refresh token.
 * Quando múltiplas requests chegam ao servidor simultaneamente com o mesmo
 * token expirado (ex: Promise.all no client), apenas UMA chamada de refresh
 * é feita à API externa. As demais aguardam o mesmo resultado.
 */
const pendingRefreshes = new Map<string, Promise<Token | null>>()

/** Executa o refresh na API externa (chamado uma única vez por token) */
async function executeRefresh(refreshToken: string): Promise<Token | null> {
  try {
    const apiBaseUrl = getApiBaseUrl()

    const rawResponse = await $fetch(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      body: { refresh_token: refreshToken },
      timeout: DEFAULT_FETCH_TIMEOUT
    })

    const tokenResponse = tokenSchema.parse(rawResponse)
    logger.debug('Token renovado com sucesso')
    return tokenResponse
  } catch (error) {
    logAuthError('Falha ao renovar tokens', error)
    return null
  }
}

/**
 * Tenta renovar os tokens de autenticação.
 * Função centralizada com dedup: requests concorrentes com o mesmo refresh token
 * compartilham uma única chamada à API externa.
 *
 * @returns RefreshResult com o novo access token ou erro
 */
export async function tryRefreshTokens(event: H3Event): Promise<RefreshResult> {
  const accessToken = getAccessToken(event)

  // Sem token ou token ainda válido
  if (!accessToken || !shouldRefreshToken(accessToken)) {
    return { success: true, accessToken: accessToken || undefined }
  }

  const refreshToken = getRefreshToken(event)

  // Sem refresh token - não conseguimos renovar
  if (!refreshToken) {
    clearAuthCookies(event)
    return { success: false, error: AuthErrors.REFRESH_TOKEN_MISSING }
  }

  // Dedup: reusar refresh em andamento para o mesmo token
  let refreshPromise = pendingRefreshes.get(refreshToken)
  if (!refreshPromise) {
    refreshPromise = executeRefresh(refreshToken)
    pendingRefreshes.set(refreshToken, refreshPromise)
    // Limpar após resolução (todas as requests concorrentes já receberam o resultado)
    refreshPromise.finally(() => pendingRefreshes.delete(refreshToken))
  }

  const tokenResponse = await refreshPromise

  if (!tokenResponse) {
    clearAuthCookies(event)
    return { success: false, error: AuthErrors.SESSION_EXPIRED }
  }

  // Atualizar cookies em CADA response (cada request precisa do Set-Cookie header)
  setAuthCookies(event, tokenResponse.access_token, tokenResponse.refresh_token)

  return { success: true, accessToken: tokenResponse.access_token }
}
