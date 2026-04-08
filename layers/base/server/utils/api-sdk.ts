/**
 * Wrapper genérico para chamadas à API externa via BFF.
 *
 * Uso:
 *   const data = await callApi(
 *     (config) => myApiFetch(config, params),
 *     'contexto de erro',
 *   )
 */

import type { ApiClientConfig } from './api-client'

/**
 * Executa uma chamada à API externa com error handling.
 * Para chamadas autenticadas, passe o accessToken.
 */
export async function callApi<T>(
  apiFn: (config: ApiClientConfig) => Promise<T>,
  errorContext: string,
  accessToken?: string
): Promise<T> {
  const config = createApiClient(accessToken)

  try {
    return await apiFn(config)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    logger.error(errorContext, error)
    throw createError({ statusCode: 500, message: errorContext })
  }
}
