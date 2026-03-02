/**
 * Middleware guest — redireciona se já está autenticado.
 * Uso: definePageMeta({ middleware: 'guest' })
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (auth.isAuthenticated) {
    return navigateTo('/app')
  }
})
