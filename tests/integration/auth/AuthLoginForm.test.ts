/** Testes de integração para AuthLoginForm */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AuthLoginForm from '~/layers/auth/app/components/AuthLoginForm.vue'

// Mock do useAuthStore
const mockLogin = vi.fn()
const mockFetchUser = vi.fn()
vi.mock('~/layers/auth/app/composables/useAuthStore', () => ({
  useAuthStore: () => ({
    // Estado
    user: null,
    isLoading: false,
    error: null,
    isInitialized: true,
    lastFetchAt: 0,

    // Getters
    isAuthenticated: false,
    userName: '',
    userEmail: '',
    userInitials: '',
    permissions: [],
    groups: [],

    // Helpers de permissão
    hasPermission: vi.fn().mockReturnValue(false),
    hasAnyPermission: vi.fn().mockReturnValue(false),
    hasGroup: vi.fn().mockReturnValue(false),
    hasAnyGroup: vi.fn().mockReturnValue(false),

    // Actions
    login: mockLogin,
    logout: vi.fn(),
    fetchUser: mockFetchUser,
    resetPassword: vi.fn(),
    clearError: vi.fn()
  })
}))

// Mock do useRouter (auto-importado no Nuxt)
const mockPush = vi.fn()
vi.stubGlobal('useRouter', () => ({ push: mockPush }))

function createWrapper(props = {}) {
  return mount(AuthLoginForm, {
    props,
    global: {
      stubs: {
        Alert: { template: '<div data-testid="alert"><slot /></div>' },
        AlertDescription: { template: '<span><slot /></span>' },
        Label: { template: '<label><slot /></label>' },
        Input: {
          template:
            '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          props: ['modelValue']
        },
        Button: {
          template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
          props: ['disabled']
        },
        Icon: { template: '<span />' },
        NuxtLink: { template: '<a><slot /></a>' }
      }
    }
  })
}

describe('AuthLoginForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('renderiza campos de username e password', () => {
      const wrapper = createWrapper()
      const inputs = wrapper.findAll('input')

      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })

    it('botão de submit inicia desabilitado', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button[type="submit"]')

      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('validação', () => {
    it('habilita submit quando username e password preenchidos', async () => {
      const wrapper = createWrapper()
      const inputs = wrapper.findAll('input')

      await inputs[0]!.setValue('user@test.com')
      await inputs[1]!.setValue('password123')

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('mantém desabilitado quando apenas username preenchido', async () => {
      const wrapper = createWrapper()
      const inputs = wrapper.findAll('input')

      await inputs[0]!.setValue('user@test.com')

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('mantém desabilitado quando username é só espaços', async () => {
      const wrapper = createWrapper()
      const inputs = wrapper.findAll('input')

      await inputs[0]!.setValue('   ')
      await inputs[1]!.setValue('password123')

      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('submit', () => {
    it('chama authStore.login com credenciais', async () => {
      mockLogin.mockResolvedValue(true)
      const wrapper = createWrapper()
      const inputs = wrapper.findAll('input')

      await inputs[0]!.setValue('user@test.com')
      await inputs[1]!.setValue('senha123')
      await wrapper.find('form').trigger('submit')

      expect(mockLogin).toHaveBeenCalledWith({
        username: 'user@test.com',
        password: 'senha123'
      })
    })

    it('emite success quando login bem-sucedido', async () => {
      mockLogin.mockResolvedValue(true)
      const wrapper = createWrapper()
      const inputs = wrapper.findAll('input')

      await inputs[0]!.setValue('user@test.com')
      await inputs[1]!.setValue('senha123')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('success')).toBeTruthy()
    })

    it('chama login com dados corretos para redirectTo customizado', async () => {
      mockLogin.mockResolvedValue(true)
      const wrapper = createWrapper({ redirectTo: '/dashboard' })
      const inputs = wrapper.findAll('input')

      await inputs[0]!.setValue('user@test.com')
      await inputs[1]!.setValue('senha123')
      await wrapper.find('form').trigger('submit')

      expect(mockLogin).toHaveBeenCalledWith({
        username: 'user@test.com',
        password: 'senha123'
      })
      expect(wrapper.emitted('success')).toBeTruthy()
    })

    it('não emite success quando login falha', async () => {
      mockLogin.mockResolvedValue(false)
      const wrapper = createWrapper()
      const inputs = wrapper.findAll('input')

      await inputs[0]!.setValue('user@test.com')
      await inputs[1]!.setValue('senha123')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('success')).toBeFalsy()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('não chama login quando canSubmit é false', async () => {
      const wrapper = createWrapper()
      await wrapper.find('form').trigger('submit')

      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe('toggle password', () => {
    it('alterna visibilidade da senha', async () => {
      const wrapper = createWrapper()
      const toggleBtn = wrapper.find('button[type="button"]')

      // Inicia como password
      const passwordInput = wrapper.findAll('input')[1]!
      expect(passwordInput.attributes('type')).toBe('password')

      await toggleBtn.trigger('click')
      expect(passwordInput.attributes('type')).toBe('text')

      await toggleBtn.trigger('click')
      expect(passwordInput.attributes('type')).toBe('password')
    })
  })
})
