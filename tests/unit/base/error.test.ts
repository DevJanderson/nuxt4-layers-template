import { describe, it, expect } from 'vitest'
import { extractErrorMessage, isUnauthorizedError } from '~/layers/base/app/utils/error'

describe('extractErrorMessage', () => {
  it('retorna data.message quando presente', () => {
    const error = { data: { message: 'Erro da API' } }
    expect(extractErrorMessage(error, 'fallback')).toBe('Erro da API')
  })

  it('retorna message quando data.message ausente', () => {
    const error = { message: 'Erro genérico' }
    expect(extractErrorMessage(error, 'fallback')).toBe('Erro genérico')
  })

  it('retorna statusMessage quando message ausente', () => {
    const error = { statusMessage: 'Not Found' }
    expect(extractErrorMessage(error, 'fallback')).toBe('Not Found')
  })

  it('retorna default quando erro é objeto sem campos conhecidos', () => {
    const error = { foo: 'bar' }
    expect(extractErrorMessage(error, 'fallback')).toBe('fallback')
  })

  it('retorna default quando erro não é objeto', () => {
    expect(extractErrorMessage(null, 'fallback')).toBe('fallback')
    expect(extractErrorMessage(undefined, 'fallback')).toBe('fallback')
    expect(extractErrorMessage('string', 'fallback')).toBe('fallback')
    expect(extractErrorMessage(42, 'fallback')).toBe('fallback')
  })

  it('prioriza data.message sobre message e statusMessage', () => {
    const error = {
      data: { message: 'Mais específico' },
      message: 'Genérico',
      statusMessage: 'Status'
    }
    expect(extractErrorMessage(error, 'fallback')).toBe('Mais específico')
  })
})

describe('isUnauthorizedError', () => {
  it('retorna true para statusCode 401', () => {
    expect(isUnauthorizedError({ statusCode: 401 })).toBe(true)
  })

  it('retorna false para outro statusCode', () => {
    expect(isUnauthorizedError({ statusCode: 403 })).toBe(false)
    expect(isUnauthorizedError({ statusCode: 500 })).toBe(false)
  })

  it('retorna false para não-objeto', () => {
    expect(isUnauthorizedError(null)).toBe(false)
    expect(isUnauthorizedError(undefined)).toBe(false)
    expect(isUnauthorizedError('401')).toBe(false)
  })

  it('retorna false para objeto sem statusCode', () => {
    expect(isUnauthorizedError({ message: 'unauthorized' })).toBe(false)
  })
})
