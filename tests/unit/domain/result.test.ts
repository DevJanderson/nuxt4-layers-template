import { describe, it, expect } from 'vitest'
import { ok, fail, combineResults, unwrap, unwrapOr } from '#shared/domain/result'

describe('Result', () => {
  describe('ok()', () => {
    it('cria resultado de sucesso', () => {
      const result = ok(42)
      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value).toBe(42)
    })

    it('aceita qualquer tipo de valor', () => {
      const r1 = ok('texto')
      if (r1.ok) expect(r1.value).toBe('texto')

      const r2 = ok(null)
      if (r2.ok) expect(r2.value).toBeNull()

      const r3 = ok(undefined)
      if (r3.ok) expect(r3.value).toBeUndefined()

      const r4 = ok({ a: 1 })
      if (r4.ok) expect(r4.value).toEqual({ a: 1 })

      const r5 = ok([1, 2])
      if (r5.ok) expect(r5.value).toEqual([1, 2])
    })
  })

  describe('fail()', () => {
    it('cria resultado de falha com string', () => {
      const result = fail('deu ruim')
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toBe('deu ruim')
    })

    it('aceita tipo de erro customizado', () => {
      const result = fail({ code: 'INVALID', field: 'email' })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toEqual({ code: 'INVALID', field: 'email' })
    })
  })

  describe('combineResults()', () => {
    it('retorna ok quando todos são ok', () => {
      const result = combineResults([ok(1), ok('a'), ok(true)])
      expect(result.ok).toBe(true)
    })

    it('retorna fail com todos os erros quando algum falha', () => {
      const result = combineResults([ok(1), fail('erro A'), ok(2), fail('erro B')])
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toEqual(['erro A', 'erro B'])
      }
    })

    it('retorna ok para lista vazia', () => {
      const result = combineResults([])
      expect(result.ok).toBe(true)
    })

    it('coleta erro único', () => {
      const result = combineResults([ok(1), fail('único')])
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toEqual(['único'])
      }
    })
  })

  describe('unwrap()', () => {
    it('retorna valor de ok', () => {
      expect(unwrap(ok(42))).toBe(42)
    })

    it('lança erro de fail', () => {
      expect(() => unwrap(fail('motivo'))).toThrow('motivo')
    })
  })

  describe('unwrapOr()', () => {
    it('retorna valor de ok', () => {
      expect(unwrapOr(ok(42), 0)).toBe(42)
    })

    it('retorna fallback de fail', () => {
      expect(unwrapOr(fail('erro'), 0)).toBe(0)
    })
  })

  describe('type narrowing', () => {
    it('discrimina ok com if', () => {
      const result = ok(42) as ReturnType<typeof ok<number>>

      if (result.ok) {
        const _v: number = result.value
        expect(_v).toBe(42)
      }
    })

    it('discrimina fail com if', () => {
      const result = fail('erro') as ReturnType<typeof fail<string>>

      if (!result.ok) {
        const _e: string = result.error
        expect(_e).toBe('erro')
      }
    })
  })
})
