import { describe, it, expect } from 'vitest'
import { ValidationErrors } from '#shared/domain/errors'

describe('Domain Errors', () => {
  describe('ValidationErrors', () => {
    it('gera mensagem de param inválido', () => {
      expect(ValidationErrors.INVALID_BODY).toBe('dados inválidos no corpo da requisição')
      expect(ValidationErrors.INVALID_PARAM('id')).toBe('parâmetro de rota inválido: id')
      expect(ValidationErrors.INVALID_PARAM('userId')).toBe('parâmetro de rota inválido: userId')
    })
  })
})
