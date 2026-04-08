/**
 * Utilitários de validação para endpoints BFF
 * Centraliza o padrão readBody + safeParse e validação de route params
 */

import type { H3Event } from 'h3'
import type { ZodType } from 'zod'
import { ValidationErrors } from '#shared/domain/errors'

export async function validateBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: ValidationErrors.INVALID_BODY
    })
  }

  return result.data
}

/**
 * Valida e retorna um route param numérico.
 * Lança 400 se ausente ou não-numérico (previne path traversal).
 */
export function validateRouteParam(event: H3Event, name: string): string {
  const value = getRouterParam(event, name)

  if (!value || !/^\d+$/.test(value)) {
    throw createError({
      statusCode: 400,
      message: ValidationErrors.INVALID_PARAM(name)
    })
  }

  return value
}

/**
 * Valida e retorna um route param string (não-vazio).
 * Lança 400 se ausente.
 */
export function validateStringParam(event: H3Event, name: string): string {
  const value = getRouterParam(event, name)

  if (!value) {
    throw createError({
      statusCode: 400,
      message: ValidationErrors.INVALID_PARAM(name)
    })
  }

  return value
}

/**
 * Valida e retorna um route param UUID.
 * Lança 400 se ausente ou com formato inválido (previne path traversal).
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function validateQuery<T>(event: H3Event, schema: ZodType<T>): T {
  const query = getQuery(event)
  const result = schema.safeParse(query)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: ValidationErrors.INVALID_QUERY
    })
  }

  return result.data
}

export function validateUniqueId(event: H3Event, name: string = 'uniqueId'): string {
  const value = getRouterParam(event, name)

  if (!value || !UUID_RE.test(value)) {
    throw createError({
      statusCode: 400,
      message: ValidationErrors.INVALID_PARAM(name)
    })
  }

  return value
}
