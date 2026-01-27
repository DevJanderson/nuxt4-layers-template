/**
 * Server Middleware - Example Logger
 *
 * Server middleware executa em TODAS as requisições ao servidor.
 * Diferente do app/middleware que executa em navegações de página.
 *
 * Casos de uso:
 * - Logging de requisições
 * - Autenticação de API
 * - Rate limiting
 * - CORS customizado
 */
export default defineEventHandler((event) => {
  // Executar apenas para rotas de example
  if (!event.path.startsWith('/api/example')) {
    return
  }

  // Log da requisição
  const method = event.method
  const path = event.path
  const timestamp = new Date().toISOString()

  console.log(`[${timestamp}] ${method} ${path}`)

  // Adicionar informação ao contexto (acessível em outros handlers)
  event.context.requestedAt = timestamp
})
