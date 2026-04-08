/**
 * Factory de client genérico para chamadas server-side à API externa.
 *
 * Cria configuração de client com:
 * - baseUrl da runtimeConfig (NUXT_API_BASE_URL)
 * - Authorization Bearer token
 * - Timeout de 15s
 */

const DEFAULT_TIMEOUT = 15_000

export interface ApiClientConfig {
  baseUrl: string
  headers: Record<string, string>
  timeout: number
}

/**
 * Cria uma configuração de client para a API externa.
 * Usado nas rotas BFF para chamadas autenticadas ou públicas.
 *
 * @param accessToken - Token JWT para Authorization header (opcional)
 * @returns Configuração do client com baseUrl, headers e timeout
 */
export function createApiClient(accessToken?: string): ApiClientConfig {
  const config = useRuntimeConfig()
  const baseUrl = config.apiBaseUrl as string

  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      message: 'NUXT_API_BASE_URL não configurada'
    })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  return { baseUrl, headers, timeout: DEFAULT_TIMEOUT }
}
