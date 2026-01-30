/**
 * Validators do módulo Example
 * Funções puras de validação
 */

import type { ValidationResult } from './types'

/**
 * Valida dados para criação de Example
 */
export function validateCreateExample(name: string, description?: string): ValidationResult {
  const errors: Record<string, string> = {}

  if (!name || name.trim().length === 0) {
    errors.name = 'Nome é obrigatório'
  } else if (name.length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres'
  } else if (name.length > 100) {
    errors.name = 'Nome deve ter no máximo 100 caracteres'
  }

  if (description && description.length > 500) {
    errors.description = 'Descrição deve ter no máximo 500 caracteres'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
