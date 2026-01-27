import { describe, it, expect } from 'vitest'

/**
 * Example Unit Test
 * Demonstra a estrutura básica de testes unitários
 */
describe('Example Unit Test', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should work with objects', () => {
    const user = { name: 'Test', email: 'test@example.com' }
    expect(user).toHaveProperty('name')
    expect(user.email).toContain('@')
  })

  it('should work with arrays', () => {
    const items = ['a', 'b', 'c']
    expect(items).toHaveLength(3)
    expect(items).toContain('b')
  })
})

/**
 * Example: Testing a pure function
 */
describe('Pure Function Example', () => {
  // Example function
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  it('should format currency correctly', () => {
    // Usando toContain para evitar problemas com non-breaking space
    expect(formatCurrency(100)).toContain('100,00')
    expect(formatCurrency(1234.56)).toContain('1.234,56')
  })

  it('should handle zero', () => {
    expect(formatCurrency(0)).toContain('0,00')
  })

  it('should handle negative values', () => {
    expect(formatCurrency(-50)).toContain('50,00')
  })
})
