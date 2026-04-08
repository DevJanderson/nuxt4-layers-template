/**
 * Testes unitários para server/utils/validation
 * validateBody, validateQuery, validateRouteParam, validateStringParam, validateUniqueId
 * Roda em Node puro (projeto "unit") - sem Nuxt
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'

import {
  validateBody,
  validateQuery,
  validateRouteParam,
  validateStringParam,
  validateUniqueId
} from '~/layers/base/server/utils/validation'

// Mock H3 globals (auto-importados no Nitro)
const mockReadBody = vi.fn()
const mockGetRouterParam = vi.fn()
const mockGetQuery = vi.fn()
const mockCreateError = vi.fn((opts: { statusCode: number; message: string }) => {
  const err = new Error(opts.message) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})

vi.stubGlobal('readBody', mockReadBody)
vi.stubGlobal('getRouterParam', mockGetRouterParam)
vi.stubGlobal('getQuery', mockGetQuery)
vi.stubGlobal('createError', mockCreateError)

// Evento H3 fake
const fakeEvent = {} as Parameters<typeof validateBody>[0]

beforeEach(() => {
  vi.clearAllMocks()
})

// === validateBody ===

describe('validateBody', () => {
  const schema = z.object({ name: z.string(), age: z.number() })

  it('retorna dados validados quando body é válido', async () => {
    mockReadBody.mockResolvedValue({ name: 'João', age: 30 })

    const result = await validateBody(fakeEvent, schema)

    expect(result).toEqual({ name: 'João', age: 30 })
  })

  it('lança 400 quando body é inválido', async () => {
    mockReadBody.mockResolvedValue({ name: 123 })

    await expect(validateBody(fakeEvent, schema)).rejects.toThrow()
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'dados inválidos no corpo da requisição'
    })
  })

  it('lança 400 quando body está vazio', async () => {
    mockReadBody.mockResolvedValue({})

    await expect(validateBody(fakeEvent, schema)).rejects.toThrow()
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'dados inválidos no corpo da requisição'
    })
  })

  it('lança 400 quando body é null', async () => {
    mockReadBody.mockResolvedValue(null)

    await expect(validateBody(fakeEvent, schema)).rejects.toThrow()
  })

  it('remove campos extras via schema (strip)', async () => {
    mockReadBody.mockResolvedValue({ name: 'Ana', age: 25, extra: 'field' })

    const result = await validateBody(fakeEvent, schema)

    expect(result).toEqual({ name: 'Ana', age: 25 })
    expect(result).not.toHaveProperty('extra')
  })
})

// === validateQuery ===

describe('validateQuery', () => {
  const schema = z.object({
    page: z.coerce.number().optional(),
    search: z.string().optional()
  })

  it('retorna query validada quando parâmetros são válidos', () => {
    mockGetQuery.mockReturnValue({ page: '2', search: 'test' })

    const result = validateQuery(fakeEvent, schema)

    expect(result).toEqual({ page: 2, search: 'test' })
  })

  it('retorna objeto vazio quando nenhum param é enviado', () => {
    mockGetQuery.mockReturnValue({})

    const result = validateQuery(fakeEvent, schema)

    expect(result).toEqual({})
  })

  it('lança 400 quando query é inválida', () => {
    const strictSchema = z.object({ page: z.coerce.number().int().positive() })
    mockGetQuery.mockReturnValue({ page: 'abc' })

    expect(() => validateQuery(fakeEvent, strictSchema)).toThrow()
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'parâmetros de consulta inválidos'
    })
  })
})

// === validateRouteParam ===

describe('validateRouteParam', () => {
  it('retorna valor quando param é numérico', () => {
    mockGetRouterParam.mockReturnValue('42')

    const result = validateRouteParam(fakeEvent, 'id')

    expect(result).toBe('42')
  })

  it('aceita números grandes', () => {
    mockGetRouterParam.mockReturnValue('9999999')

    expect(validateRouteParam(fakeEvent, 'id')).toBe('9999999')
  })

  it('lança 400 quando param não é numérico', () => {
    mockGetRouterParam.mockReturnValue('abc')

    expect(() => validateRouteParam(fakeEvent, 'id')).toThrow()
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'parâmetro de rota inválido: id'
    })
  })

  it('lança 400 quando param é undefined', () => {
    mockGetRouterParam.mockReturnValue(undefined)

    expect(() => validateRouteParam(fakeEvent, 'id')).toThrow()
  })

  it('lança 400 quando param é string vazia', () => {
    mockGetRouterParam.mockReturnValue('')

    expect(() => validateRouteParam(fakeEvent, 'id')).toThrow()
  })

  it('lança 400 quando param contém letras misturadas (path traversal)', () => {
    mockGetRouterParam.mockReturnValue('12abc')

    expect(() => validateRouteParam(fakeEvent, 'id')).toThrow()
  })

  it('lança 400 quando param contém caracteres especiais', () => {
    mockGetRouterParam.mockReturnValue('1.2')

    expect(() => validateRouteParam(fakeEvent, 'id')).toThrow()
  })
})

// === validateStringParam ===

describe('validateStringParam', () => {
  it('retorna valor quando param é string não-vazia', () => {
    mockGetRouterParam.mockReturnValue('slug-name')

    const result = validateStringParam(fakeEvent, 'slug')

    expect(result).toBe('slug-name')
  })

  it('lança 400 quando param é undefined', () => {
    mockGetRouterParam.mockReturnValue(undefined)

    expect(() => validateStringParam(fakeEvent, 'slug')).toThrow()
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'parâmetro de rota inválido: slug'
    })
  })

  it('lança 400 quando param é string vazia', () => {
    mockGetRouterParam.mockReturnValue('')

    expect(() => validateStringParam(fakeEvent, 'slug')).toThrow()
  })
})

// === validateUniqueId ===

describe('validateUniqueId', () => {
  const validUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

  it('retorna UUID quando formato é válido', () => {
    mockGetRouterParam.mockReturnValue(validUuid)

    const result = validateUniqueId(fakeEvent, 'uniqueId')

    expect(result).toBe(validUuid)
  })

  it('aceita UUID uppercase', () => {
    mockGetRouterParam.mockReturnValue(validUuid.toUpperCase())

    expect(validateUniqueId(fakeEvent, 'uniqueId')).toBe(validUuid.toUpperCase())
  })

  it('usa "uniqueId" como nome padrão do param', () => {
    mockGetRouterParam.mockReturnValue(validUuid)

    validateUniqueId(fakeEvent)

    expect(mockGetRouterParam).toHaveBeenCalledWith(fakeEvent, 'uniqueId')
  })

  it('lança 400 quando UUID é inválido', () => {
    mockGetRouterParam.mockReturnValue('not-a-uuid')

    expect(() => validateUniqueId(fakeEvent, 'id')).toThrow()
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'parâmetro de rota inválido: id'
    })
  })

  it('lança 400 quando UUID é undefined', () => {
    mockGetRouterParam.mockReturnValue(undefined)

    expect(() => validateUniqueId(fakeEvent)).toThrow()
  })

  it('lança 400 quando UUID tem formato parcial', () => {
    mockGetRouterParam.mockReturnValue('a1b2c3d4-e5f6-7890')

    expect(() => validateUniqueId(fakeEvent)).toThrow()
  })

  it('lança 400 quando UUID tem caracteres inválidos', () => {
    mockGetRouterParam.mockReturnValue('a1b2c3d4-e5f6-7890-abcd-ef123456789g')

    expect(() => validateUniqueId(fakeEvent)).toThrow()
  })
})
