/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado.
 *
 * TODO: substituir mock pela chamada real via authFetch
 */
export default defineEventHandler(async event => {
  const token = getAccessToken(event)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  // TODO: chamar API externa
  // const user = await authFetch(event, '/auth/me')

  // Mock — substituir por resposta real
  return {
    id: '1',
    email: 'usuario@example.com',
    name: 'Usuário Exemplo'
  }
})
