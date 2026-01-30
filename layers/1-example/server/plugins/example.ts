/**
 * Server Plugin - Executa na inicialização do servidor
 *
 * Use para:
 * - Inicializar conexões com banco de dados
 * - Configurar clientes de serviços externos
 * - Registrar hooks do servidor
 */
export default defineNitroPlugin((nitroApp) => {
  // Hook: quando o servidor inicia
  nitroApp.hooks.hook('request', (_event) => {
    // Executado em cada requisição
    // Útil para métricas globais
  })

  // Hook: antes de enviar resposta
  nitroApp.hooks.hook('beforeResponse', (_event, _response) => {
    // Modificar resposta antes de enviar
    // Útil para adicionar headers globais
  })

  // Hook: quando ocorre erro
  nitroApp.hooks.hook('error', (error, { event: _event }) => {
    // Log de erros centralizado
    console.error('[Server Error]', error.message)
  })

  // Exemplo: inicializar cliente de banco
  // const db = new PrismaClient()
  // nitroApp.hooks.hook('close', async () => {
  //   await db.$disconnect()
  // })

  console.log('[Example Plugin] Server initialized')
})
