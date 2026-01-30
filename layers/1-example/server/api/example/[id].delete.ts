/**
 * DELETE /api/example/:id
 *
 * Remove um item de exemplo.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID é obrigatório'
    })
  }

  // Verificar se existe (substitua por consulta ao banco)
  // const existing = await db.example.findUnique({ where: { id } })
  // if (!existing) {
  //   throw createError({ statusCode: 404, statusMessage: 'Item não encontrado' })
  // }

  // Deletar (substitua por delete no banco)
  // await db.example.delete({ where: { id } })

  // Retornar 204 No Content
  setResponseStatus(event, 204)
  return null
})
