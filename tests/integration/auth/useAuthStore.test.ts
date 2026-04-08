/**
 * Testes de integração para useAuthStore
 * Roda com @nuxt/test-utils (projeto "nuxt") - auto-imports reais disponíveis
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'

// Mock do useAuthApi
const mockLogin = vi.fn()
const mockLogout = vi.fn()
const mockGetMe = vi.fn()
const mockResetPassword = vi.fn()

vi.mock('~/layers/auth/app/composables/useAuthApi', () => ({
  useAuthApi: () => ({
    login: mockLogin,
    logout: mockLogout,
    getMe: mockGetMe,
    resetPassword: mockResetPassword,
    refresh: vi.fn()
  })
}))

// Mock do useRouter via @nuxt/test-utils
mockNuxtImport('useRouter', () => () => ({
  push: vi.fn(),
  replace: vi.fn()
}))

const { useAuthStore } = await import('~/layers/auth/app/composables/useAuthStore')

/** Dados brutos da API (DTO AuthUser) */
const mockApiUser = {
  id: 1,
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  ativo: true,
  telefone: '(11) 99999-9999',
  estado: 'SP',
  cidade: 'São Paulo',
  funcao: 'gestor',
  instituicao: 'Empresa Teste',
  ultimo_login: '2024-01-01T00:00:00Z',
  permissoes: [
    { id: 1, codigo: 'dashboard.view', nome: 'Ver Dashboard' },
    { id: 2, codigo: 'reports.view', nome: 'Ver Relatórios' }
  ],
  grupos: [{ id: 1, nome: 'admin', descricao: 'Administradores do sistema' }]
}

/** UserModel esperado após createUserModel(mockApiUser) */
const expectedUserModel = {
  raw: mockApiUser,
  id: 1,
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  ativo: true,
  initials: 'JS',
  permissions: ['dashboard.view', 'reports.view'],
  groups: ['admin'],
  isAdmin: true
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('deve iniciar sem usuário', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('deve iniciar não inicializado', () => {
      const store = useAuthStore()
      expect(store.isInitialized).toBe(false)
    })
  })

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      mockLogin.mockResolvedValue({ user: mockApiUser })

      const store = useAuthStore()
      const success = await store.login({
        username: 'joao@exemplo.com',
        password: 'senha123'
      })

      expect(success).toBe(true)
      expect(store.user).toEqual(expectedUserModel)
      expect(store.isAuthenticated).toBe(true)
      expect(store.error).toBeNull()
    })

    it('deve definir erro ao falhar login', async () => {
      mockLogin.mockRejectedValue({
        data: { message: 'credenciais inválidas' }
      })

      const store = useAuthStore()
      const success = await store.login({
        username: 'joao@exemplo.com',
        password: 'senhaerrada'
      })

      expect(success).toBeFalsy()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.error).toBe('credenciais inválidas')
    })

    it('deve definir isLoading durante o login', async () => {
      let resolveLogin: (value: unknown) => void
      mockLogin.mockImplementation(
        () =>
          new Promise(resolve => {
            resolveLogin = resolve
          })
      )

      const store = useAuthStore()
      const loginPromise = store.login({
        username: 'joao@exemplo.com',
        password: 'senha123'
      })

      expect(store.isLoading).toBe(true)

      resolveLogin!({ user: mockApiUser })
      await loginPromise

      expect(store.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('deve fazer logout e limpar estado', async () => {
      mockLogin.mockResolvedValue({ user: mockApiUser })
      mockLogout.mockResolvedValue(undefined)

      const store = useAuthStore()
      await store.login({
        username: 'joao@exemplo.com',
        password: 'senha123'
      })

      expect(store.isAuthenticated).toBe(true)

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('deve limpar estado mesmo se API falhar', async () => {
      mockLogin.mockResolvedValue({ user: mockApiUser })
      mockLogout.mockRejectedValue(new Error('Erro de rede'))

      const store = useAuthStore()
      await store.login({
        username: 'joao@exemplo.com',
        password: 'senha123'
      })

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('fetchUser', () => {
    it('deve buscar dados do usuário', async () => {
      mockGetMe.mockResolvedValue({ user: mockApiUser })

      const store = useAuthStore()
      await store.fetchUser()

      expect(store.user).toEqual(expectedUserModel)
      expect(store.isInitialized).toBe(true)
    })

    it('deve limpar usuário se 401', async () => {
      mockGetMe.mockRejectedValue({ statusCode: 401 })

      const store = useAuthStore()
      await store.fetchUser()

      expect(store.user).toBeNull()
      expect(store.isInitialized).toBe(true)
    })
  })

  describe('Getters de usuário', () => {
    beforeEach(async () => {
      mockLogin.mockResolvedValue({ user: mockApiUser })
    })

    it('deve retornar userName', async () => {
      const store = useAuthStore()
      await store.login({ username: 'joao@exemplo.com', password: 'senha123' })

      expect(store.userName).toBe('João Silva')
    })

    it('deve retornar userEmail', async () => {
      const store = useAuthStore()
      await store.login({ username: 'joao@exemplo.com', password: 'senha123' })

      expect(store.userEmail).toBe('joao@exemplo.com')
    })

    it('deve retornar userInitials com duas palavras', async () => {
      const store = useAuthStore()
      await store.login({ username: 'joao@exemplo.com', password: 'senha123' })

      expect(store.userInitials).toBe('JS')
    })

    it('deve retornar userInitials com uma palavra', async () => {
      mockLogin.mockResolvedValue({
        user: { ...mockApiUser, nome: 'João' }
      })

      const store = useAuthStore()
      await store.login({ username: 'joao@exemplo.com', password: 'senha123' })

      expect(store.userInitials).toBe('JO')
    })
  })

  describe('Permissões', () => {
    beforeEach(async () => {
      mockLogin.mockResolvedValue({ user: mockApiUser })
    })

    it('deve verificar hasPermission corretamente', async () => {
      const store = useAuthStore()
      await store.login({ username: 'joao@exemplo.com', password: 'senha123' })

      expect(store.hasPermission('dashboard.view')).toBe(true)
      expect(store.hasPermission('admin.full')).toBe(false)
    })

    it('deve verificar hasAnyPermission corretamente', async () => {
      const store = useAuthStore()
      await store.login({ username: 'joao@exemplo.com', password: 'senha123' })

      expect(store.hasAnyPermission(['dashboard.view', 'admin.full'])).toBe(true)
      expect(store.hasAnyPermission(['admin.full', 'users.manage'])).toBe(false)
    })

    it('deve verificar hasGroup corretamente', async () => {
      const store = useAuthStore()
      await store.login({ username: 'joao@exemplo.com', password: 'senha123' })

      expect(store.hasGroup('admin')).toBe(true)
      expect(store.hasGroup('visitantes')).toBe(false)
    })

    it('deve verificar hasAnyGroup corretamente', async () => {
      const store = useAuthStore()
      await store.login({ username: 'joao@exemplo.com', password: 'senha123' })

      expect(store.hasAnyGroup(['admin', 'visitantes'])).toBe(true)
      expect(store.hasAnyGroup(['visitantes', 'convidados'])).toBe(false)
    })
  })

  describe('resetPassword', () => {
    it('deve solicitar reset de senha com sucesso', async () => {
      mockResetPassword.mockResolvedValue({
        message: 'Email enviado com sucesso'
      })

      const store = useAuthStore()
      const result = await store.resetPassword({ email: 'joao@exemplo.com' })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Email enviado com sucesso')
    })

    it('deve retornar erro ao falhar', async () => {
      mockResetPassword.mockRejectedValue({
        statusMessage: 'Erro ao enviar email'
      })

      const store = useAuthStore()
      const result = await store.resetPassword({ email: 'invalido' })

      expect(result.success).toBe(false)
    })
  })

  describe('clearError', () => {
    it('deve limpar o erro', async () => {
      mockLogin.mockRejectedValue({ statusMessage: 'Erro' })

      const store = useAuthStore()
      await store.login({ username: 'a', password: 'b' })

      expect(store.error).not.toBeNull()

      store.clearError()

      expect(store.error).toBeNull()
    })
  })
})
