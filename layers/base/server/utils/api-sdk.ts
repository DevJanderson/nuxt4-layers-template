/**
 * Wrapper genérico para chamadas à API externa via BFF.
 *
 * Uso:
 *   const data = await callApi(
 *     (config) => myApiFetch(config, params),
 *     event,
 *     'contexto de erro',
 *   )
 */

import type { H3Event } from 'h3'
import type { ApiClientConfig } from './api-client'

/**
 * Executa uma chamada à API externa com auth e error handling.
 * Espera que um middleware anterior injete `event.context.auth.accessToken`.
 */
export async function callApi<T>(
  apiFn: (config: ApiClientConfig) => Promise<T>,
  event: H3Event,
  errorContext: string
): Promise<T> {
  const auth = event.context.auth as { accessToken?: string | null } | undefined
  if (!auth?.accessToken) {
    throw createError({ statusCode: 401, message: 'não autenticado' })
  }
  const config = createApiClient(auth.accessToken)

  try {
    return await apiFn(config)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    logger.error(errorContext, error)
    throw createError({ statusCode: 500, message: errorContext })
  }
}

/**
 * Variante sem autenticação para chamadas públicas.
 */
export async function callPublicApi<T>(
  apiFn: (config: ApiClientConfig) => Promise<T>,
  errorContext: string
): Promise<T> {
  const config = createApiClient()

  try {
    return await apiFn(config)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    logger.error(errorContext, error)
    throw createError({ statusCode: 500, message: errorContext })
  }
}
