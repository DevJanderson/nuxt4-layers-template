/**
 * GET /api/example
 *
 * Lista todos os itens de exemplo.
 * Convenção de nomenclatura: {rota}.{método}.ts
 */
export default defineEventHandler(async (event) => {
  // Obter query params
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10

  // Simular dados (substitua por consulta ao banco)
  const items = [
    { id: '1', name: 'Item 1', createdAt: new Date().toISOString() },
    { id: '2', name: 'Item 2', createdAt: new Date().toISOString() },
    { id: '3', name: 'Item 3', createdAt: new Date().toISOString() }
  ]

  return {
    data: items,
    meta: {
      page,
      limit,
      total: items.length
    }
  }
})
