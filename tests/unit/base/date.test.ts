import { describe, it, expect } from 'vitest'
import { formatDate } from '~/layers/base/app/utils/date'

describe('formatDate', () => {
  it('formata data ISO válida em pt-BR', () => {
    const result = formatDate('2026-03-15T14:30:00Z')
    expect(result).toMatch(/15\/03\/2026/)
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('retorna "--" para null', () => {
    expect(formatDate(null)).toBe('--')
  })

  it('retorna "--" para undefined', () => {
    expect(formatDate(undefined)).toBe('--')
  })

  it('retorna "--" para string vazia', () => {
    expect(formatDate('')).toBe('--')
  })
})
