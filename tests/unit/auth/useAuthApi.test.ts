/**
 * Testes unitários para useAuthApi
 * Roda em Node puro (projeto "unit") - sem Nuxt
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useAuthApi } from '~/layers/auth/app/composables/useAuthApi'

// Mock do $fetch global
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

const mockUser = {
  id: 1,
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  ativo: true,
  permissoes: [],
  grupos: []
}

describe('useAuthApi', () => {
  let api: ReturnType<typeof useAuthApi>

  beforeEach(() => {
    mockFetch.mockReset()
    api = useAuthApi()
  })

  describe('login', () => {
    it('deve chamar /api/auth/login com credenciais', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })

      const credentials = { username: 'joao@exemplo.com', password: 'senha123' }
      await api.login(credentials)

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
    })

    it('deve retornar dados do usuário', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })

      const result = await api.login({
        username: 'joao@exemplo.com',
        password: 'senha123'
      })

      expect(result.user).toEqual(mockUser)
    })
  })

  describe('logout', () => {
    it('deve chamar /api/auth/logout', async () => {
      mockFetch.mockResolvedValue(undefined)

      await api.logout()

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST'
      })
    })
  })

  describe('getMe', () => {
    it('deve chamar /api/auth/me', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })

      await api.getMe()

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', { headers: undefined })
    })

    it('deve retornar dados do usuário', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })

      const result = await api.getMe()

      expect(result.user).toEqual(mockUser)
    })
  })

  describe('resetPassword', () => {
    it('deve chamar /api/auth/reset-password com email', async () => {
      mockFetch.mockResolvedValue({ message: 'Email enviado' })

      await api.resetPassword({ email: 'joao@exemplo.com' })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/reset-password', {
        method: 'POST',
        body: { email: 'joao@exemplo.com' }
      })
    })

    it('deve retornar mensagem de sucesso', async () => {
      mockFetch.mockResolvedValue({ message: 'Email enviado' })

      const result = await api.resetPassword({ email: 'joao@exemplo.com' })

      expect(result.message).toBe('Email enviado')
    })
  })

  describe('refresh', () => {
    it('deve chamar /api/auth/refresh', async () => {
      mockFetch.mockResolvedValue(undefined)

      await api.refresh()

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'POST'
      })
    })
  })
})
