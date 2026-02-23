/**
 * Middleware de autenticação — protege rotas que exigem login.
 * Uso: definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (auth.isAuthenticated) return

  // Tenta buscar o usuário (SSR cookie forwarding via useAuthApi)
  await auth.fetchUser()
  if (auth.isAuthenticated) return

  // Tenta refresh do token
  const refreshed = await auth.refreshSession()
  if (refreshed) return

  return navigateTo('/login')
})
