/**
 * Value Object — Email
 *
 * Normaliza para lowercase + trim. Valida formato no factory.
 * Imutável após criação.
 *
 * Reutilizável em formulários (client) e endpoints BFF (server)
 * via tryCreateEmail() + Result.
 */

import { ok, fail } from '#shared/domain/result'
import type { Result } from '#shared/domain/result'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface Email {
  readonly value: string
  readonly local: string
  readonly domain: string
}

export function createEmail(value: string): Email {
  const trimmed = value.trim().toLowerCase()

  if (!trimmed) {
    throw new Error('Email é obrigatório')
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    throw new Error('Email inválido')
  }

  const atIndex = trimmed.indexOf('@')
  const local = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1)
  return Object.freeze({ value: trimmed, local, domain })
}

export function tryCreateEmail(value: string): Result<Email> {
  try {
    return ok(createEmail(value))
  } catch (e) {
    return fail((e as Error).message)
  }
}

export function isValidEmail(value: string): boolean {
  try {
    createEmail(value)
    return true
  } catch {
    return false
  }
}

export function emailEquals(a: Email, b: Email): boolean {
  return a.value === b.value
}
