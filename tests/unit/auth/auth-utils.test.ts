/**
 * Testes unitários para funções puras de auth server utils
 * isApiError, parseJwt, isTokenExpired, shouldRefreshToken,
 * createAuthHeaders, logAuthError
 * Roda em Node puro (projeto "unit") - sem Nuxt
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  isApiError,
  parseJwt,
  isTokenExpired,
  shouldRefreshToken,
  createAuthHeaders,
  logAuthError
} from '~/layers/auth/server/utils/auth'

import { TOKEN_REFRESH_MARGIN_SECONDS } from '~/layers/base/shared/utils/auth-constants'

// Mocks de globais auto-importados pelo Nuxt (necessários antes do import)
const mockLogger = { error: vi.fn(), debug: vi.fn(), info: vi.fn() }
const mockGetCookie = vi.fn()
const mockSetCookie = vi.fn()
const mockDeleteCookie = vi.fn()
const mockUseRuntimeConfig = vi.fn()
const mockCreateError = vi.fn((opts: Record<string, unknown>) => {
  const e = new Error(opts.message as string)
  Object.assign(e, opts)
  return e
})

vi.stubGlobal('logger', mockLogger)
vi.stubGlobal('getCookie', mockGetCookie)
vi.stubGlobal('setCookie', mockSetCookie)
vi.stubGlobal('deleteCookie', mockDeleteCookie)
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)
vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('$fetch', vi.fn())

// ---------------------------------------------------------------------------
// Helper: cria um JWT fake com payload customizado (sem assinatura real)
// ---------------------------------------------------------------------------
function createTestJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.fake-signature`
}

// ============================================================================
// isApiError
// ============================================================================
describe('isApiError', () => {
  it('retorna true para objeto com statusCode numérico', () => {
    expect(isApiError({ statusCode: 401 })).toBe(true)
  })

  it('retorna true para objeto com statusCode e statusMessage', () => {
    expect(isApiError({ statusCode: 500, statusMessage: 'error' })).toBe(true)
  })

  it('retorna false para null', () => {
    expect(isApiError(null)).toBe(false)
  })

  it('retorna false para undefined', () => {
    expect(isApiError(undefined)).toBe(false)
  })

  it('retorna false para string', () => {
    expect(isApiError('error')).toBe(false)
  })

  it('retorna false para número', () => {
    expect(isApiError(42)).toBe(false)
  })

  it('retorna false para objeto sem statusCode', () => {
    expect(isApiError({ message: 'erro' })).toBe(false)
  })

  it('retorna false para statusCode não numérico', () => {
    expect(isApiError({ statusCode: 'not-a-number' })).toBe(false)
  })
})

// ============================================================================
// parseJwt
// ============================================================================
describe('parseJwt', () => {
  it('decodifica payload de um JWT válido', () => {
    const token = createTestJwt({ sub: 'user-123', exp: 1700000000 })
    const result = parseJwt(token)

    expect(result).not.toBeNull()
    expect(result!.sub).toBe('user-123')
    expect(result!.exp).toBe(1700000000)
  })

  it('retorna null para token inválido (não tem 3 partes)', () => {
    expect(parseJwt('abc.def')).toBeNull()
    expect(parseJwt('only-one-part')).toBeNull()
    expect(parseJwt('a.b.c.d')).toBeNull()
  })

  it('retorna null para string vazia', () => {
    expect(parseJwt('')).toBeNull()
  })

  it('retorna null para payload base64 malformado', () => {
    const invalidPayload = Buffer.from('not-json{{{').toString('base64url')
    expect(parseJwt(`header.${invalidPayload}.signature`)).toBeNull()
  })
})

// ============================================================================
// isTokenExpired
// ============================================================================
describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna true para token expirado', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600
    const token = createTestJwt({ sub: '1', exp: pastExp })

    expect(isTokenExpired(token)).toBe(true)
  })

  it('retorna false para token válido (exp no futuro)', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    const token = createTestJwt({ sub: '1', exp: futureExp })

    expect(isTokenExpired(token)).toBe(false)
  })

  it('retorna true para token sem campo exp', () => {
    const token = createTestJwt({ sub: '1' })
    expect(isTokenExpired(token)).toBe(true)
  })

  it('respeita margem em segundos', () => {
    // Token expira em 2 minutos, margem de 5 minutos → expirado
    const exp = Math.floor(Date.now() / 1000) + 120
    const token = createTestJwt({ sub: '1', exp })

    expect(isTokenExpired(token, 300)).toBe(true)
  })

  it('retorna false quando fora da margem de expiração', () => {
    // Token expira em 10 minutos, margem de 5 minutos → válido
    const exp = Math.floor(Date.now() / 1000) + 600
    const token = createTestJwt({ sub: '1', exp })

    expect(isTokenExpired(token, 300)).toBe(false)
  })

  it('retorna true para token não-parseável', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true)
  })
})

// ============================================================================
// shouldRefreshToken
// ============================================================================
describe('shouldRefreshToken', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delega para isTokenExpired com TOKEN_REFRESH_MARGIN_SECONDS', () => {
    // Token expira em TOKEN_REFRESH_MARGIN_SECONDS + 60s → ainda não precisa refresh
    const exp = Math.floor(Date.now() / 1000) + TOKEN_REFRESH_MARGIN_SECONDS + 60
    const tokenValido = createTestJwt({ sub: '1', exp })

    expect(shouldRefreshToken(tokenValido)).toBe(false)

    // Token expira em TOKEN_REFRESH_MARGIN_SECONDS - 60s → precisa refresh
    const expProximo = Math.floor(Date.now() / 1000) + TOKEN_REFRESH_MARGIN_SECONDS - 60
    const tokenProximo = createTestJwt({ sub: '1', exp: expProximo })

    expect(shouldRefreshToken(tokenProximo)).toBe(true)
  })

  it('retorna true para token já expirado', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100
    const token = createTestJwt({ sub: '1', exp: pastExp })

    expect(shouldRefreshToken(token)).toBe(true)
  })
})

// ============================================================================
// createAuthHeaders
// ============================================================================
describe('createAuthHeaders', () => {
  it('retorna headers corretos de Authorization e Content-Type', () => {
    const headers = createAuthHeaders('my-token-123')

    expect(headers).toEqual({
      Authorization: 'Bearer my-token-123',
      'Content-Type': 'application/json'
    })
  })

  it('inclui o token exato no header Authorization', () => {
    const token = 'eyJhbGciOiJIUzI1NiJ9.test.sig'
    const headers = createAuthHeaders(token)

    expect(headers.Authorization).toBe(`Bearer ${token}`)
  })
})

// ============================================================================
// logAuthError
// ============================================================================
describe('logAuthError', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    mockLogger.error.mockClear()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('loga com detalhes do erro fora de produção', () => {
    process.env.NODE_ENV = 'development'
    const error = new Error('falha na conexão')

    logAuthError('Login', error)

    expect(mockLogger.error).toHaveBeenCalledWith('[Auth] Login:', error)
  })

  it('loga sem detalhes do erro em produção', () => {
    process.env.NODE_ENV = 'production'
    const error = new Error('dados sensíveis')

    logAuthError('Refresh', error)

    expect(mockLogger.error).toHaveBeenCalledWith('[Auth] Refresh')
  })

  it('loga contexto correto em teste (não-produção)', () => {
    process.env.NODE_ENV = 'test'
    const error = { code: 'TIMEOUT' }

    logAuthError('Fetch API', error)

    expect(mockLogger.error).toHaveBeenCalledWith('[Auth] Fetch API:', error)
  })
})
