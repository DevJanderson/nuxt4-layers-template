/**
 * Server Middleware - Admin Check
 *
 * EXECUCAO: Antes de cada request no servidor (apos 01.auth.ts)
 *
 * RESPONSABILIDADES:
 * 1. Verifica se o usuario autenticado e admin
 * 2. Injeta event.context.isAdmin no contexto
 *
 * O prefixo "02." garante execucao apos o middleware de auth.
 *
 * Cache in-memory com TTL de 60s por accessToken para evitar
 * fetch redundante à API em cada request admin.
 */

import { ADMIN_GROUP } from '#shared/utils/auth-constants'

const CACHE_TTL_MS = 60_000 // 60 segundos
const adminCache = new Map<string, { isAdmin: boolean; expiresAt: number }>()

/** Remove entradas expiradas periodicamente (a cada 100 lookups) */
let lookupCount = 0
function pruneCache(): void {
  if (++lookupCount < 100) return
  lookupCount = 0
  const now = Date.now()
  for (const [key, entry] of adminCache) {
    if (entry.expiresAt <= now) adminCache.delete(key)
  }
}

export default defineEventHandler(async event => {
  const path = getRequestURL(event).pathname

  // Apenas verificar em rotas de admin
  if (!path.startsWith('/api/usuarios/admin')) {
    return
  }

  const auth = event.context.auth
  if (!auth?.isAuthenticated || !auth.accessToken) {
    event.context.isAdmin = false
    return
  }

  // Verificar cache antes de fazer fetch
  pruneCache()
  const cached = adminCache.get(auth.accessToken)
  if (cached && cached.expiresAt > Date.now()) {
    event.context.isAdmin = cached.isAdmin
    return
  }

  try {
    const client = createApiClient(auth.accessToken)
    const user = await $fetch<{ grupos?: Array<{ nome: string }> }>(
      `${client.baseUrl}/api/v1/usuarios/me`,
      {
        headers: client.headers,
        timeout: client.timeout
      }
    )

    const isAdmin = user?.grupos?.some(g => g.nome === ADMIN_GROUP) ?? false

    // Cachear resultado
    adminCache.set(auth.accessToken, {
      isAdmin,
      expiresAt: Date.now() + CACHE_TTL_MS
    })

    event.context.isAdmin = isAdmin
  } catch {
    event.context.isAdmin = false
  }
})

// Tipos para o contexto
declare module 'h3' {
  interface H3EventContext {
    isAdmin?: boolean
  }
}
