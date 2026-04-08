import { describe, it, expect } from 'vitest'
import { AuthErrors, ValidationErrors } from '#shared/domain/errors'

describe('Domain Errors', () => {
  describe('AuthErrors', () => {
    it('contém códigos de erro de autenticação', () => {
      expect(AuthErrors.INVALID_CREDENTIALS).toBe('credenciais inválidas')
      expect(AuthErrors.SESSION_EXPIRED).toContain('sessão expirada')
      expect(AuthErrors.LOGIN_FAILED).toBe('falha ao realizar login')
      expect(AuthErrors.FETCH_USER_FAILED).toBe('falha ao buscar dados do usuário')
    })

    it('tem todos os campos esperados', () => {
      const keys = Object.keys(AuthErrors)
      expect(keys).toContain('INVALID_CREDENTIALS')
      expect(keys).toContain('SESSION_EXPIRED')
      expect(keys).toContain('NOT_AUTHENTICATED')
      expect(keys).toContain('FORBIDDEN')
      expect(keys).toContain('ADMIN_ONLY')
      expect(keys).toContain('LOGIN_FAILED')
      expect(keys).toContain('LOGOUT_FAILED')
      expect(keys).toContain('FETCH_USER_FAILED')
      expect(keys).toContain('RESET_PASSWORD_FAILED')
      expect(keys).toContain('CONFIG_MISSING')
    })
  })

  describe('ValidationErrors', () => {
    it('gera mensagem de param inválido', () => {
      expect(ValidationErrors.INVALID_BODY).toBe('dados inválidos no corpo da requisição')
      expect(ValidationErrors.INVALID_PARAM('id')).toBe('parâmetro de rota inválido: id')
      expect(ValidationErrors.INVALID_PARAM('userId')).toBe('parâmetro de rota inválido: userId')
    })
  })
})
