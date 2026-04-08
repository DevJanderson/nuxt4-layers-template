import { describe, it, expect } from 'vitest'
import {
  createEmail,
  tryCreateEmail,
  isValidEmail,
  emailEquals
} from '~/layers/base/app/utils/email'

describe('Email VO', () => {
  describe('createEmail()', () => {
    it('cria email válido com normalização', () => {
      const email = createEmail('  User@Example.COM  ')
      expect(email.value).toBe('user@example.com')
      expect(email.local).toBe('user')
      expect(email.domain).toBe('example.com')
    })

    it('retorna objeto imutável', () => {
      const email = createEmail('test@test.com')
      expect(Object.isFrozen(email)).toBe(true)
    })

    it('lança erro para string vazia', () => {
      expect(() => createEmail('')).toThrow('Email é obrigatório')
      expect(() => createEmail('   ')).toThrow('Email é obrigatório')
    })

    it('lança erro para formato inválido', () => {
      expect(() => createEmail('sem-arroba')).toThrow('Email inválido')
      expect(() => createEmail('sem@dominio')).toThrow('Email inválido')
      expect(() => createEmail('@dominio.com')).toThrow('Email inválido')
      expect(() => createEmail('user@')).toThrow('Email inválido')
      expect(() => createEmail('user @test.com')).toThrow('Email inválido')
    })

    it('aceita formatos válidos', () => {
      expect(createEmail('a@b.co').value).toBe('a@b.co')
      expect(createEmail('user.name@domain.com.br').value).toBe('user.name@domain.com.br')
      expect(createEmail('user+tag@gmail.com').value).toBe('user+tag@gmail.com')
    })
  })

  describe('tryCreateEmail()', () => {
    it('retorna ok para email válido', () => {
      const result = tryCreateEmail('test@test.com')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.value).toBe('test@test.com')
      }
    })

    it('retorna fail para email inválido', () => {
      const result = tryCreateEmail('invalido')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('Email inválido')
      }
    })

    it('retorna fail para vazio', () => {
      const result = tryCreateEmail('')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('Email é obrigatório')
      }
    })
  })

  describe('isValidEmail()', () => {
    it('retorna true para válidos', () => {
      expect(isValidEmail('user@test.com')).toBe(true)
    })

    it('retorna false para inválidos', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('invalido')).toBe(false)
    })
  })

  describe('emailEquals()', () => {
    it('compara por valor normalizado', () => {
      const a = createEmail('User@Test.com')
      const b = createEmail('user@test.com')
      expect(emailEquals(a, b)).toBe(true)
    })

    it('diferencia emails distintos', () => {
      const a = createEmail('a@test.com')
      const b = createEmail('b@test.com')
      expect(emailEquals(a, b)).toBe(false)
    })
  })
})
