/**
 * Server Middleware - Autenticação
 *
 * EXECUÇÃO: Antes de cada request no servidor
 *
 * RESPONSABILIDADES:
 * 1. Verifica se há access token nos cookies
 * 2. Se o token está próximo de expirar, renova automaticamente
 * 3. Injeta informações de auth no contexto do evento
 *
 * O prefixo "01." garante execução antes de outros middlewares.
 */

/** Prefixos de rotas que não requerem verificação de auth */
const PUBLIC_PATH_PREFIXES = [
  '/api/auth/login',
  '/api/auth/reset-password',
  '/_nuxt',
  '/__nuxt',
  '/.well-known',
  '/favicon.ico'
] as const

export default defineEventHandler(async event => {
  // Ignorar rotas públicas e estáticas
  const path = getRequestURL(event).pathname

  if (PUBLIC_PATH_PREFIXES.some(p => path.startsWith(p))) {
    return
  }

  const accessToken = getAccessToken(event)

  // Sem token - não autenticado (ok para rotas públicas)
  if (!accessToken) {
    event.context.auth = { isAuthenticated: false, user: null }
    return
  }

  // Tentar renovar tokens se necessário (lógica centralizada)
  const refreshResult = await tryRefreshTokens(event)

  if (!refreshResult.success) {
    // Refresh falhou - usuário precisa fazer login novamente
    event.context.auth = { isAuthenticated: false, user: null }
    return
  }

  // Token válido (original ou renovado)
  event.context.auth = {
    isAuthenticated: true,
    accessToken: refreshResult.accessToken
  }
})

// Tipos para o contexto de auth
declare module 'h3' {
  interface H3EventContext {
    auth?: {
      isAuthenticated: boolean
      accessToken?: string
      user?: unknown
    }
  }
}
