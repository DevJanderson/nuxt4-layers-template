import { describe, it, expect, vi } from 'vitest'

vi.stubGlobal('defineEventHandler', (fn: (e: unknown) => unknown) => fn)

const mockEvent = {} as never

describe('GET /api/health', () => {
  it('retorna status ok e timestamp valido', async () => {
    const handler = (await import('~/layers/base/server/api/health.get')).default
    const result = handler(mockEvent)

    expect(result).toHaveProperty('status', 'ok')
    expect(result).toHaveProperty('timestamp')
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp)
  })
})
