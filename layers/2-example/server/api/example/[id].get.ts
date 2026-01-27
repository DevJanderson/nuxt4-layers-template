/**
 * GET /api/example/:id
 *
 * Obtém um item de exemplo pelo ID.
 * [id] no nome do arquivo = parâmetro dinâmico
 */
export default defineEventHandler(async (event) => {
  // Obter parâmetro da rota
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID é obrigatório'
    })
  }

  // Buscar item (substitua por consulta ao banco)
  const item = {
    id,
    name: `Item ${id}`,
    description: 'Descrição do item de exemplo',
    createdAt: new Date().toISOString()
  }

  // Simular item não encontrado
  // if (!item) {
  //   throw createError({
  //     statusCode: 404,
  //     statusMessage: 'Item não encontrado'
  //   })
  // }

  return item
})
