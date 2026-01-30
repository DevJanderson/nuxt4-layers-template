/**
 * Middleware específico da Feature Layer
 *
 * Tipos de middleware:
 * - Named: example-guard.ts → middleware: 'example-guard'
 * - Global: example-guard.global.ts → executa em todas as rotas
 *
 * Uso na página:
 * definePageMeta({
 *   middleware: 'example-guard'
 * })
 */
export default defineNuxtRouteMiddleware((_to, _from) => {
  // Exemplo: verificar se usuário tem permissão
  // const { user } = useUserSession()

  // Exemplo: redirecionar se não autenticado
  // if (!user.value) {
  //   return navigateTo('/login')
  // }

  // Exemplo: verificar role específica
  // if (!user.value?.roles.includes('example-access')) {
  //   return abortNavigation()
  // }

  // Permitir navegação (não retornar nada)
})
