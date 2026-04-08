/**
 * Testes unitários para auth server utils
 * parseJwt, isTokenExpired, shouldRefreshToken
 * Roda em Node puro (projeto "unit") - sem Nuxt
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { parseJwt, isTokenExpired } from '~/layers/auth/server/utils/auth'

// Helper: cria um JWT fake com payload customizado (sem assinatura real)
function createFakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.fake-signature`
}

describe('parseJwt', () => {
  it('decodifica payload de um JWT válido', () => {
    const token = createFakeJwt({ sub: 'user-123', exp: 1700000000 })
    const result = parseJwt(token)

    expect(result).not.toBeNull()
    expect(result!.sub).toBe('user-123')
    expect(result!.exp).toBe(1700000000)
  })

  it('retorna null para string vazia', () => {
    expect(parseJwt('')).toBeNull()
  })

  it('retorna null para token com menos de 3 partes', () => {
    expect(parseJwt('abc.def')).toBeNull()
  })

  it('retorna null para token com mais de 3 partes', () => {
    expect(parseJwt('a.b.c.d')).toBeNull()
  })

  it('retorna null para payload base64 inválido (JSON malformado)', () => {
    // Payload que não é JSON válido
    const invalidPayload = Buffer.from('not-json{{{').toString('base64url')
    expect(parseJwt(`header.${invalidPayload}.signature`)).toBeNull()
  })

  it('decodifica tokens com caracteres base64url (+ e /)', () => {
    // Payload com caracteres que diferem entre base64 e base64url
    const payload = { sub: 'user+test/special', exp: 1700000000 }
    const token = createFakeJwt(payload)
    const result = parseJwt(token)

    expect(result).not.toBeNull()
    expect(result!.sub).toBe('user+test/special')
  })

  it('preserva campos extras do payload', () => {
    const token = createFakeJwt({ sub: '1', exp: 100, iat: 50, role: 'admin', org_id: 42 })
    const result = parseJwt(token)

    expect(result).not.toBeNull()
    expect(result!.role).toBe('admin')
    expect(result!.org_id).toBe(42)
    expect(result!.iat).toBe(50)
  })
})

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna true para token já expirado', () => {
    // Token expirou há 1 hora
    const pastExp = Math.floor(Date.now() / 1000) - 3600
    const token = createFakeJwt({ sub: '1', exp: pastExp })

    expect(isTokenExpired(token)).toBe(true)
  })

  it('retorna false para token ainda válido', () => {
    // Token expira em 1 hora
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    const token = createFakeJwt({ sub: '1', exp: futureExp })

    expect(isTokenExpired(token)).toBe(false)
  })

  it('retorna true quando token está dentro da margem de expiração', () => {
    // Token expira em 2 minutos, margem de 5 minutos
    const exp = Math.floor(Date.now() / 1000) + 120
    const token = createFakeJwt({ sub: '1', exp })

    expect(isTokenExpired(token, 300)).toBe(true)
  })

  it('retorna false quando token está fora da margem de expiração', () => {
    // Token expira em 10 minutos, margem de 5 minutos
    const exp = Math.floor(Date.now() / 1000) + 600
    const token = createFakeJwt({ sub: '1', exp })

    expect(isTokenExpired(token, 300)).toBe(false)
  })

  it('retorna true para token sem campo exp', () => {
    const token = createFakeJwt({ sub: '1' })
    expect(isTokenExpired(token)).toBe(true)
  })

  it('retorna true para token inválido (não-JWT)', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true)
  })

  it('margem padrão é 0 (sem margem)', () => {
    // Token expira em 1 segundo
    const exp = Math.floor(Date.now() / 1000) + 1
    const token = createFakeJwt({ sub: '1', exp })

    // Sem margem: ainda válido
    expect(isTokenExpired(token)).toBe(false)
    // Com margem de 2s: expirado
    expect(isTokenExpired(token, 2)).toBe(true)
  })

  it('trata expiração exata (exp === now) como expirado', () => {
    const now = Math.floor(Date.now() / 1000)
    const token = createFakeJwt({ sub: '1', exp: now })

    expect(isTokenExpired(token)).toBe(true)
  })
})
