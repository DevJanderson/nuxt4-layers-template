import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatTimeAgo } from '~/layers/base/app/utils/format-time-ago'

describe('formatTimeAgo', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna string vazia para null', () => {
    expect(formatTimeAgo(null)).toBe('')
  })

  it('retorna string vazia para undefined', () => {
    expect(formatTimeAgo(undefined)).toBe('')
  })

  it('retorna "Agora" para menos de 1 hora atrás', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-15T12:00:00Z'))
    expect(formatTimeAgo('2026-03-15T11:30:00Z')).toBe('Agora')
    expect(formatTimeAgo('2026-03-15T11:59:00Z')).toBe('Agora')
  })

  it('retorna "Há Xh" para 1-23 horas atrás', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-15T12:00:00Z'))
    expect(formatTimeAgo('2026-03-15T08:00:00Z')).toBe('Há 4h')
    expect(formatTimeAgo('2026-03-15T11:00:00Z')).toBe('Há 1h')
  })

  it('retorna "Ontem" para exatamente 1 dia atrás', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-15T12:00:00Z'))
    expect(formatTimeAgo('2026-03-14T12:00:00Z')).toBe('Ontem')
  })

  it('retorna "Há X dias" para mais de 1 dia', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-15T12:00:00Z'))
    expect(formatTimeAgo('2026-03-12T12:00:00Z')).toBe('Há 3 dias')
  })
})
