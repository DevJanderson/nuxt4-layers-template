/**
 * Auth Store
 * Pinia store para gerenciamento de estado de autenticação
 * Usa Composition API para garantir contexto Nuxt correto
 */

import type { LoginCredentials, ResetPasswordData } from '../types'
import type { UserModel } from '../utils/user-model'
import { AuthErrors } from '#shared/domain/errors'
// createUserModel, userHas* são auto-importados de layers/auth/app/utils/
// extractErrorMessage e isUnauthorizedError são auto-importados de layers/base/app/utils/

// ============================================================================
// STORE
// ============================================================================

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = shallowRef<UserModel | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)
  const lastFetchAt = ref(0)

  // API instanciada no contexto de setup
  const api = useAuthApi()

  // --------------------------------------------------------------------------
  // GETTERS
  // --------------------------------------------------------------------------

  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => user.value?.nome ?? '')
  const userEmail = computed(() => user.value?.email ?? '')
  const userInitials = computed(() => user.value?.initials ?? '')
  const permissions = computed(() => user.value?.permissions ?? [])
  const groups = computed(() => user.value?.groups ?? [])

  // --------------------------------------------------------------------------
  // HELPERS DE PERMISSÃO (delegam para o UserModel)
  // --------------------------------------------------------------------------

  function hasPermission(codigo: string): boolean {
    return user.value ? userHasPermission(user.value, codigo) : false
  }

  function hasAnyPermission(codigos: string[]): boolean {
    return user.value ? userHasAnyPermission(user.value, codigos) : false
  }

  function hasGroup(nome: string): boolean {
    return user.value ? userHasGroup(user.value, nome) : false
  }

  function hasAnyGroup(nomes: string[]): boolean {
    return user.value ? userHasAnyGroup(user.value, nomes) : false
  }

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------

  /**
   * Realiza login com credenciais
   * @returns true se login foi bem sucedido
   */
  async function login(credentials: LoginCredentials): Promise<boolean> {
    return withStoreAction(
      { isLoading, error },
      AuthErrors.LOGIN_FAILED,
      async () => {
        const response = await api.login(credentials)
        user.value = createUserModel(response.user)
        isInitialized.value = true
        lastFetchAt.value = Date.now()
        return true
      },
      false
    )
  }

  /**
   * Realiza logout
   * @returns true se logout foi bem sucedido no servidor
   */
  async function logout(): Promise<boolean> {
    const result = await withStoreAction(
      { isLoading, error },
      AuthErrors.LOGOUT_FAILED,
      async () => {
        await api.logout()
        user.value = null
        return true
      },
      false
    )
    if (!result) {
      user.value = null
    }
    return result
  }

  /**
   * Busca dados do usuário autenticado
   */
  async function fetchUser(): Promise<void> {
    if (isLoading.value) return

    await withStoreAction({ isLoading, error }, AuthErrors.FETCH_USER_FAILED, async () => {
      try {
        const response = await api.getMe()
        user.value = response.user ? createUserModel(response.user) : null
      } catch (e: unknown) {
        if (isUnauthorizedError(e)) {
          user.value = null
          return
        }
        throw e
      } finally {
        isInitialized.value = true
        lastFetchAt.value = Date.now()
      }
    })
  }

  /**
   * Solicita reset de senha
   */
  async function resetPassword(
    data: ResetPasswordData
  ): Promise<{ success: boolean; message: string }> {
    const result = await withStoreAction(
      { isLoading, error },
      AuthErrors.RESET_PASSWORD_FAILED,
      async (): Promise<{ success: boolean; message: string }> => {
        const response = await api.resetPassword(data)
        return { success: true, message: response.message }
      },
      { success: false, message: '' }
    )

    if (!result.success) {
      return { success: false, message: error.value || AuthErrors.RESET_PASSWORD_FAILED }
    }

    return result
  }

  /**
   * Limpa mensagem de erro
   */
  function clearError(): void {
    error.value = null
  }

  // --------------------------------------------------------------------------
  // EXPORT
  // --------------------------------------------------------------------------

  return {
    // Estado
    user,
    isLoading,
    error,
    isInitialized,
    lastFetchAt,

    // Getters
    isAuthenticated,
    userName,
    userEmail,
    userInitials,
    permissions,
    groups,

    // Helpers de permissão
    hasPermission,
    hasAnyPermission,
    hasGroup,
    hasAnyGroup,

    // Actions
    login,
    logout,
    fetchUser,
    resetPassword,
    clearError
  }
})
