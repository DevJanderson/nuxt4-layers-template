/**
 * Server Utils - Funções utilitárias do servidor
 *
 * Utils em server/utils/ são auto-importados nos handlers.
 * Use para lógica reutilizável no servidor.
 */

/**
 * Valida ownership de um recurso (proteção IDOR)
 */
export function validateOwnership(
  resourceUserId: string,
  currentUserId: string | undefined
): void {
  if (!currentUserId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Não autenticado'
    })
  }

  if (resourceUserId !== currentUserId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acesso negado'
    })
  }
}

/**
 * Pagina um array de resultados
 */
export function paginate<T>(
  items: T[],
  page: number,
  limit: number
): { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } } {
  const total = items.length
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const data = items.slice(offset, offset + limit)

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages
    }
  }
}

/**
 * Obtém o IP do cliente de forma segura
 */
export function getClientIp(event: any): string {
  return (
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getHeader(event, 'x-real-ip') ||
    event.node?.req?.socket?.remoteAddress ||
    'unknown'
  )
}
