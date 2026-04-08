import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks de server utils (auto-import no Nitro)
const mockValidateBody = vi.fn()
const mockExecuteLogin = vi.fn()
const mockHandleLoginResult = vi.fn()
const mockGetAccessToken = vi.fn()
const mockGetRefreshToken = vi.fn()
const mockLogAuthError = vi.fn()
const mockClearAuthCookies = vi.fn()
const mockTryRefreshTokens = vi.fn()
const mockIsApiError = vi.fn()
const mockCallApi = vi.fn()
const mockCallPublicApi = vi.fn()
const mockCreateApiClient = vi
  .fn()
  .mockReturnValue({ baseUrl: 'http://localhost:3000', headers: {}, timeout: 15000 })
const mockFetch = vi.fn()
const mockCreateError = vi.fn((opts: { statusCode: number; message: string }) => {
  const err = new Error(opts.message) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})

vi.stubGlobal('validateBody', mockValidateBody)
vi.stubGlobal('executeLogin', mockExecuteLogin)
vi.stubGlobal('handleLoginResult', mockHandleLoginResult)
vi.stubGlobal('getAccessToken', mockGetAccessToken)
vi.stubGlobal('getRefreshToken', mockGetRefreshToken)
vi.stubGlobal('logAuthError', mockLogAuthError)
vi.stubGlobal('clearAuthCookies', mockClearAuthCookies)
vi.stubGlobal('tryRefreshTokens', mockTryRefreshTokens)
vi.stubGlobal('isApiError', mockIsApiError)
vi.stubGlobal('callApi', mockCallApi)
vi.stubGlobal('callPublicApi', mockCallPublicApi)
vi.stubGlobal('createApiClient', mockCreateApiClient)
vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('defineEventHandler', (fn: (e: unknown) => unknown) => fn)

const mockEvent = {} as never

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/auth/login', () => {
  it('valida body e executa login', async () => {
    mockValidateBody.mockResolvedValue({ username: 'user', password: 'pass' })
    mockExecuteLogin.mockResolvedValue({ ok: true })
    mockHandleLoginResult.mockReturnValue({ success: true })

    const handler = (await import('~/layers/auth/server/api/auth/login.post')).default
    await handler(mockEvent)

    expect(mockValidateBody).toHaveBeenCalledWith(mockEvent, expect.any(Object))
    expect(mockExecuteLogin).toHaveBeenCalledWith({ username: 'user', password: 'pass' })
    expect(mockHandleLoginResult).toHaveBeenCalled()
  })
})

describe('POST /api/auth/logout', () => {
  it('notifica API via $fetch e limpa cookies', async () => {
    mockGetAccessToken.mockReturnValue('token123')
    mockGetRefreshToken.mockReturnValue('refresh456')
    mockFetch.mockResolvedValue({})

    const handler = (await import('~/layers/auth/server/api/auth/logout.post')).default
    const result = await handler(mockEvent)

    expect(mockCreateApiClient).toHaveBeenCalledWith('token123')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('logout'),
      expect.objectContaining({
        method: 'POST',
        body: { refresh_token: 'refresh456' }
      })
    )
    expect(mockClearAuthCookies).toHaveBeenCalledWith(mockEvent)
    expect(result).toEqual({ success: true, message: expect.any(String) })
  })

  it('limpa cookies mesmo quando API falha', async () => {
    mockGetAccessToken.mockReturnValue('token123')
    mockGetRefreshToken.mockReturnValue('refresh456')
    mockFetch.mockRejectedValue(new Error('API down'))

    const handler = (await import('~/layers/auth/server/api/auth/logout.post')).default
    const result = await handler(mockEvent)

    expect(mockClearAuthCookies).toHaveBeenCalledWith(mockEvent)
    expect(result.success).toBe(true)
  })
})

describe('GET /api/auth/me', () => {
  it('retorna user quando token valido', async () => {
    mockTryRefreshTokens.mockResolvedValue({ success: true, accessToken: 'valid' })
    mockFetch.mockResolvedValue({ id: 1, name: 'Test' })

    const handler = (await import('~/layers/auth/server/api/auth/me.get')).default
    const result = await handler(mockEvent)

    expect(mockCreateApiClient).toHaveBeenCalledWith('valid')
    expect(result).toEqual({ user: { id: 1, name: 'Test' } })
  })

  it('retorna user null quando refresh falha', async () => {
    mockTryRefreshTokens.mockResolvedValue({ success: false })

    const handler = (await import('~/layers/auth/server/api/auth/me.get')).default
    const result = await handler(mockEvent)

    expect(result).toEqual({ user: null })
  })

  it('retorna user null quando sem accessToken', async () => {
    mockTryRefreshTokens.mockResolvedValue({ success: true, accessToken: null })

    const handler = (await import('~/layers/auth/server/api/auth/me.get')).default
    const result = await handler(mockEvent)

    expect(result).toEqual({ user: null })
  })

  it('limpa cookies e retorna null em 401', async () => {
    mockTryRefreshTokens.mockResolvedValue({ success: true, accessToken: 'valid' })
    const err = Object.assign(new Error('Unauthorized'), { statusCode: 401 })
    mockFetch.mockRejectedValue(err)

    const handler = (await import('~/layers/auth/server/api/auth/me.get')).default
    const result = await handler(mockEvent)

    expect(mockClearAuthCookies).toHaveBeenCalledWith(mockEvent)
    expect(result).toEqual({ user: null })
  })
})

describe('POST /api/auth/refresh', () => {
  it('retorna sucesso quando refresh OK', async () => {
    mockTryRefreshTokens.mockResolvedValue({ success: true })

    const handler = (await import('~/layers/auth/server/api/auth/refresh.post')).default
    const result = await handler(mockEvent)

    expect(result).toEqual({ message: expect.any(String) })
  })

  it('lanca erro 401 quando refresh falha', async () => {
    mockTryRefreshTokens.mockResolvedValue({ success: false, error: 'expired' })

    const handler = (await import('~/layers/auth/server/api/auth/refresh.post')).default

    await expect(handler(mockEvent)).rejects.toThrow()
  })
})

describe('POST /api/auth/signup', () => {
  it('valida body e chama createApiClient', async () => {
    mockValidateBody.mockResolvedValue({ nome: 'Test', email: 'test@test.com' })
    mockFetch.mockResolvedValue({ data: { id: 1 } })

    const handler = (await import('~/layers/auth/server/api/auth/signup.post')).default
    await handler(mockEvent)

    expect(mockValidateBody).toHaveBeenCalled()
    expect(mockCreateApiClient).toHaveBeenCalled()
  })
})

describe('POST /api/auth/reset-password', () => {
  it('sempre retorna sucesso (seguranca)', async () => {
    mockValidateBody.mockResolvedValue({ email: 'test@test.com' })
    mockFetch.mockResolvedValue({})

    const handler = (await import('~/layers/auth/server/api/auth/reset-password.post')).default
    const result = await handler(mockEvent)

    expect(mockCreateApiClient).toHaveBeenCalled()
    expect(result).toEqual({ message: expect.any(String) })
  })

  it('retorna sucesso mesmo quando API falha (nao revela se email existe)', async () => {
    mockValidateBody.mockResolvedValue({ email: 'invalid@test.com' })
    mockFetch.mockRejectedValue(new Error('Not found'))

    const handler = (await import('~/layers/auth/server/api/auth/reset-password.post')).default
    const result = await handler(mockEvent)

    expect(result).toEqual({ message: expect.any(String) })
    expect(mockLogAuthError).toHaveBeenCalled()
  })
})
