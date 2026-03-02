import type { LoginRequest, User } from './types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  const api = useAuthApi()

  async function login(data: LoginRequest) {
    const response = await api.login(data)
    user.value = response.user
  }

  async function logout() {
    await api.logout()
    user.value = null
    await navigateTo('/login')
  }

  async function fetchUser() {
    try {
      user.value = await api.getMe()
    } catch {
      user.value = null
    }
  }

  async function refreshSession() {
    try {
      const response = await api.refresh()
      user.value = response.user
      return true
    } catch {
      user.value = null
      return false
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    fetchUser,
    refreshSession
  }
})
