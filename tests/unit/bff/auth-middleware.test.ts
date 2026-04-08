import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks de server utils (auto-import no Nitro)
const mockGetRequestURL = vi.fn()
const mockGetAccessToken = vi.fn()
const mockTryRefreshTokens = vi.fn()

vi.stubGlobal('getRequestURL', mockGetRequestURL)
vi.stubGlobal('getAccessToken', mockGetAccessToken)
vi.stubGlobal('tryRefreshTokens', mockTryRefreshTokens)
vi.stubGlobal('defineEventHandler', (fn: (e: unknown) => unknown) => fn)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockEvent = (): any => ({ context: {} as Record<string, unknown> })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('01.auth middleware', () => {
  it('ignora rotas públicas (/api/auth/login)', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/auth/login' })
    const event = createMockEvent()

    const handler = (await import('~/layers/auth/server/middleware/01.auth')).default
    const result = await handler(event)

    expect(result).toBeUndefined()
    expect(mockGetAccessToken).not.toHaveBeenCalled()
    expect(event.context.auth).toBeUndefined()
  })

  it('ignora rotas públicas (/_nuxt/chunk.js)', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/_nuxt/chunk.js' })
    const event = createMockEvent()

    const handler = (await import('~/layers/auth/server/middleware/01.auth')).default
    const result = await handler(event)

    expect(result).toBeUndefined()
    expect(mockGetAccessToken).not.toHaveBeenCalled()
  })

  it('ignora rotas públicas (/api/auth/reset-password)', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/auth/reset-password' })
    const event = createMockEvent()

    const handler = (await import('~/layers/auth/server/middleware/01.auth')).default
    const result = await handler(event)

    expect(result).toBeUndefined()
    expect(mockGetAccessToken).not.toHaveBeenCalled()
  })

  it('define isAuthenticated: false quando não há access token', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios' })
    mockGetAccessToken.mockReturnValue(null)
    const event = createMockEvent()

    const handler = (await import('~/layers/auth/server/middleware/01.auth')).default
    await handler(event)

    expect(event.context.auth).toEqual({ isAuthenticated: false, user: null })
  })

  it('define isAuthenticated: false quando refresh falha', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios' })
    mockGetAccessToken.mockReturnValue('expired-token')
    mockTryRefreshTokens.mockResolvedValue({ success: false })
    const event = createMockEvent()

    const handler = (await import('~/layers/auth/server/middleware/01.auth')).default
    await handler(event)

    expect(event.context.auth).toEqual({ isAuthenticated: false, user: null })
  })

  it('define isAuthenticated: true com accessToken quando refresh sucede', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios' })
    mockGetAccessToken.mockReturnValue('valid-token')
    mockTryRefreshTokens.mockResolvedValue({ success: true, accessToken: 'refreshed-token' })
    const event = createMockEvent()

    const handler = (await import('~/layers/auth/server/middleware/01.auth')).default
    await handler(event)

    expect(event.context.auth).toEqual({
      isAuthenticated: true,
      accessToken: 'refreshed-token'
    })
  })
})
