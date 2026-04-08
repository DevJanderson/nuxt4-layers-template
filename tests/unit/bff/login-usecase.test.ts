import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks de server utils (auto-import no Nitro)
const mockLogAuthError = vi.fn()
const mockClearAuthCookies = vi.fn()
const mockSetAuthCookies = vi.fn()
const mockFetch = vi.fn()
const mockCreateApiClient = vi.fn().mockReturnValue({
  baseUrl: 'https://api.test',
  headers: { Authorization: 'Bearer token' },
  timeout: 5000
})
const mockCreateError = vi.fn((opts: { statusCode: number; message: string }) => {
  const err = new Error(opts.message) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})
const mockLogger = { info: vi.fn(), error: vi.fn(), debug: vi.fn() }

vi.stubGlobal('logAuthError', mockLogAuthError)
vi.stubGlobal('clearAuthCookies', mockClearAuthCookies)
vi.stubGlobal('setAuthCookies', mockSetAuthCookies)
vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('createApiClient', mockCreateApiClient)
vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('logger', mockLogger)

const mockEvent = {} as never

beforeEach(() => {
  vi.clearAllMocks()
  mockCreateApiClient.mockReturnValue({
    baseUrl: 'https://api.test',
    headers: { Authorization: 'Bearer token' },
    timeout: 5000
  })
})

describe('executeLogin', () => {
  it('retorna ok com user e tokens quando login sucede', async () => {
    const tokenResponse = { access_token: 'at-123', refresh_token: 'rt-456' }
    const user = {
      id: 1,
      email: 'user@test.com',
      nome: 'Test User',
      ativo: true,
      permissoes: [],
      grupos: []
    }
    // Primeiro $fetch retorna tokens, segundo retorna o user
    mockFetch.mockResolvedValueOnce(tokenResponse).mockResolvedValueOnce(user)

    const { executeLogin } = await import('~/layers/auth/server/utils/login-usecase')
    const result = await executeLogin({ username: 'user@test.com', password: 'pass123' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.user).toEqual(user)
      expect(result.value.accessToken).toBe('at-123')
      expect(result.value.refreshToken).toBe('rt-456')
    }
    // Verifica que criou client publico para login (sem token)
    expect(mockCreateApiClient).toHaveBeenCalledWith()
    // Verifica que criou client autenticado para buscar user
    expect(mockCreateApiClient).toHaveBeenCalledWith('at-123')
    // Primeiro fetch: login
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/api/v1/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: { username: 'user@test.com', password: 'pass123' }
      })
    )
    // Segundo fetch: buscar user
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/v1/usuarios/me'),
      expect.any(Object)
    )
  })

  it('retorna fail INVALID_CREDENTIALS em erro 401', async () => {
    const err = Object.assign(new Error('Unauthorized'), { statusCode: 401 })
    mockFetch.mockRejectedValue(err)

    const { executeLogin } = await import('~/layers/auth/server/utils/login-usecase')
    const result = await executeLogin({ username: 'user', password: 'wrong' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('credenciais inválidas')
    }
  })

  it('retorna fail INVALID_CREDENTIALS em erro 422', async () => {
    const err = Object.assign(new Error('Validation Error'), { statusCode: 422 })
    mockFetch.mockRejectedValue(err)

    const { executeLogin } = await import('~/layers/auth/server/utils/login-usecase')
    const result = await executeLogin({ username: 'user', password: 'bad' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('credenciais inválidas')
    }
  })

  it('retorna fail LOGIN_FAILED em outros erros', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { executeLogin } = await import('~/layers/auth/server/utils/login-usecase')
    const result = await executeLogin({ username: 'user', password: 'pass' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('falha ao realizar login')
    }
    expect(mockLogAuthError).toHaveBeenCalled()
  })
})

describe('handleLoginResult', () => {
  it('retorna user e seta cookies quando result ok', async () => {
    const user = { id: 1, email: 'user@test.com', nome: 'Test User', ativo: true, permissoes: [], grupos: [] }
    const okResult = {
      ok: true as const,
      value: { user, accessToken: 'at-1', refreshToken: 'rt-1' }
    }

    const { handleLoginResult } = await import('~/layers/auth/server/utils/login-usecase')
    const result = handleLoginResult(mockEvent as never, okResult)

    expect(result).toEqual({ user })
    expect(mockSetAuthCookies).toHaveBeenCalledWith(mockEvent, 'at-1', 'rt-1')
    expect(mockLogger.info).toHaveBeenCalled()
  })

  it('lanca erro 401 quando result e INVALID_CREDENTIALS', async () => {
    const failResult = { ok: false as const, error: 'credenciais inválidas' }

    const { handleLoginResult } = await import('~/layers/auth/server/utils/login-usecase')

    expect(() => handleLoginResult(mockEvent as never, failResult)).toThrow()
    expect(mockClearAuthCookies).toHaveBeenCalledWith(mockEvent)
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 401,
      message: 'credenciais inválidas'
    })
  })

  it('lanca erro 500 em outros erros', async () => {
    const failResult = { ok: false as const, error: 'falha ao realizar login' }

    const { handleLoginResult } = await import('~/layers/auth/server/utils/login-usecase')

    expect(() => handleLoginResult(mockEvent as never, failResult)).toThrow()
    expect(mockClearAuthCookies).toHaveBeenCalledWith(mockEvent)
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'falha ao realizar login'
    })
  })
})
