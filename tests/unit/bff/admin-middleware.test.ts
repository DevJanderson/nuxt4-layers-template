import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks de server utils (auto-import no Nitro)
const mockGetRequestURL = vi.fn()
const mockFetch = vi.fn()
const mockCreateApiClient = vi.fn().mockReturnValue({
  baseUrl: 'https://api.test',
  headers: {},
  timeout: 5000
})

vi.stubGlobal('getRequestURL', mockGetRequestURL)
vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('createApiClient', mockCreateApiClient)
vi.stubGlobal('defineEventHandler', (fn: (e: unknown) => unknown) => fn)

vi.mock('#shared/utils/auth-constants', () => ({
  ADMIN_GROUP: 'admin'
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockEvent = (auth?: Record<string, unknown>): any => ({
  context: { auth } as Record<string, unknown>
})

beforeEach(() => {
  vi.clearAllMocks()
  // Reset do modulo para limpar cache in-memory entre testes
  vi.resetModules()
})

describe('02.admin middleware', () => {
  it('ignora rotas que nao sao de admin', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios/list' })
    const event = createMockEvent()

    const handler = (await import('~/layers/auth/server/middleware/02.admin')).default
    const result = await handler(event)

    expect(result).toBeUndefined()
    expect(mockFetch).not.toHaveBeenCalled()
    expect(event.context.isAdmin).toBeUndefined()
  })

  it('define isAdmin: false quando nao autenticado', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios/admin/list' })
    const event = createMockEvent({ isAuthenticated: false })

    const handler = (await import('~/layers/auth/server/middleware/02.admin')).default
    await handler(event)

    expect(event.context.isAdmin).toBe(false)
  })

  it('define isAdmin: false quando autenticado sem accessToken', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios/admin/list' })
    const event = createMockEvent({ isAuthenticated: true, accessToken: null })

    const handler = (await import('~/layers/auth/server/middleware/02.admin')).default
    await handler(event)

    expect(event.context.isAdmin).toBe(false)
  })

  it('define isAdmin: true quando usuario tem grupo admin', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios/admin/list' })
    mockFetch.mockResolvedValue({ grupos: [{ nome: 'admin' }, { nome: 'editores' }] })
    const event = createMockEvent({ isAuthenticated: true, accessToken: 'valid-token' })

    const handler = (await import('~/layers/auth/server/middleware/02.admin')).default
    await handler(event)

    expect(mockCreateApiClient).toHaveBeenCalledWith('valid-token')
    expect(mockFetch).toHaveBeenCalled()
    expect(event.context.isAdmin).toBe(true)
  })

  it('define isAdmin: false quando usuario nao tem grupo admin', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios/admin/list' })
    mockFetch.mockResolvedValue({ grupos: [{ nome: 'editores' }] })
    const event = createMockEvent({ isAuthenticated: true, accessToken: 'valid-token' })

    const handler = (await import('~/layers/auth/server/middleware/02.admin')).default
    await handler(event)

    expect(event.context.isAdmin).toBe(false)
  })

  it('define isAdmin: false quando usuario nao tem grupos', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios/admin/list' })
    mockFetch.mockResolvedValue({})
    const event = createMockEvent({ isAuthenticated: true, accessToken: 'valid-token' })

    const handler = (await import('~/layers/auth/server/middleware/02.admin')).default
    await handler(event)

    expect(event.context.isAdmin).toBe(false)
  })

  it('define isAdmin: false quando fetch lanca erro', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios/admin/list' })
    mockFetch.mockRejectedValue(new Error('API down'))
    const event = createMockEvent({ isAuthenticated: true, accessToken: 'valid-token' })

    const handler = (await import('~/layers/auth/server/middleware/02.admin')).default
    await handler(event)

    expect(event.context.isAdmin).toBe(false)
  })

  it('usa cache e evita fetch duplicado para mesmo accessToken', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios/admin/list' })
    mockFetch.mockResolvedValue({ grupos: [{ nome: 'admin' }] })

    const handler = (await import('~/layers/auth/server/middleware/02.admin')).default

    // Primeiro request — faz fetch
    const event1 = createMockEvent({ isAuthenticated: true, accessToken: 'cached-token' })
    await handler(event1)
    expect(event1.context.isAdmin).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Segundo request com mesmo token — usa cache
    const event2 = createMockEvent({ isAuthenticated: true, accessToken: 'cached-token' })
    await handler(event2)
    expect(event2.context.isAdmin).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1) // Sem fetch adicional
  })

  it('faz fetch novamente com accessToken diferente', async () => {
    mockGetRequestURL.mockReturnValue({ pathname: '/api/usuarios/admin/list' })
    mockFetch.mockResolvedValue({ grupos: [{ nome: 'admin' }] })

    const handler = (await import('~/layers/auth/server/middleware/02.admin')).default

    const event1 = createMockEvent({ isAuthenticated: true, accessToken: 'token-a' })
    await handler(event1)
    expect(mockFetch).toHaveBeenCalledTimes(1)

    const event2 = createMockEvent({ isAuthenticated: true, accessToken: 'token-b' })
    await handler(event2)
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
