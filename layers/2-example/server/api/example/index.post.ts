import { z } from 'zod'

/**
 * POST /api/example
 *
 * Cria um novo item de exemplo.
 * SEMPRE valide o body com Zod.
 */

const createExampleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  description: z.string().optional()
})

export default defineEventHandler(async (event) => {
  // Ler body da requisição
  const body = await readBody(event)

  // Validar com Zod
  const result = createExampleSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados inválidos',
      data: result.error.flatten()
    })
  }

  // Criar item (substitua por inserção no banco)
  const created = {
    id: crypto.randomUUID(),
    ...result.data,
    createdAt: new Date().toISOString()
  }

  // Retornar com status 201 Created
  setResponseStatus(event, 201)
  return created
})
