/**
 * Plugin de redirecionamento automático quando a sessão expira.
 *
 * Cobre o caso de expiração de sessão SEM navegação (ex: aba aberta por horas).
 * O middleware auth-guard cobre o caso de navegação para rota protegida.
 * O middleware auth.global cobre re-validação periódica durante navegação.
 *
 * Client-only: monitora `isAuthenticated` no auth store.
 * Quando transiciona de `true` → `false` (sessão expirou),
 * redireciona para a página de login.
 */

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const route = useRoute()

  watch(
    () => authStore.isAuthenticated,
    (isAuth, wasAuth) => {
      if (wasAuth && !isAuth) {
        // Não redirecionar se já está em rota de auth
        if (route.path.startsWith('/auth/')) return

        // Preservar rota atual para redirect após relogin
        const redirectPath = getSafeRedirectUrl(route.fullPath, '/')
        navigateTo({
          path: AUTH_ROUTES.LOGIN,
          query: { redirect: redirectPath }
        })
      }
    }
  )
})
