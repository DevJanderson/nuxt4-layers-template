import { z } from 'zod'

/**
 * PUT /api/example/:id
 *
 * Atualiza um item de exemplo.
 */

const updateExampleSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID é obrigatório'
    })
  }

  const body = await readBody(event)

  // Validar
  const result = updateExampleSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados inválidos',
      data: result.error.flatten()
    })
  }

  // Verificar se existe (substitua por consulta ao banco)
  // const existing = await db.example.findUnique({ where: { id } })
  // if (!existing) {
  //   throw createError({ statusCode: 404, statusMessage: 'Item não encontrado' })
  // }

  // Atualizar (substitua por update no banco)
  const updated = {
    id,
    ...result.data,
    updatedAt: new Date().toISOString()
  }

  return updated
})
