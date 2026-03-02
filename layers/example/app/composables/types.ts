/**
 * Types do módulo Example
 * Tipos e interfaces específicos deste módulo
 */

export interface Example {
  id: string
  name: string
  description?: string
  createdAt: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface CreateExampleData {
  name: string
  description?: string
}

export interface UpdateExampleData {
  name?: string
  description?: string
}
