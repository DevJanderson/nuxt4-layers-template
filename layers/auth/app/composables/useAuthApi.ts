import type { AuthResponse, LoginRequest, User } from './types'

export function useAuthApi() {
  const headers = useRequestHeaders(['cookie'])

  async function login(data: LoginRequest): Promise<AuthResponse> {
    return $fetch('/api/auth/login', {
      method: 'POST',
      body: data
    })
  }

  async function logout(): Promise<void> {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    })
  }

  async function getMe(): Promise<User> {
    return $fetch('/api/auth/me', {
      headers
    })
  }

  async function refresh(): Promise<AuthResponse> {
    return $fetch('/api/auth/refresh', {
      method: 'POST',
      headers
    })
  }

  return { login, logout, getMe, refresh }
}
