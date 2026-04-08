/** Testes de integração para AuthResetPasswordForm */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AuthResetPasswordForm from '~/layers/auth/app/components/AuthResetPasswordForm.vue'

// Mock do useAuthStore
const mockResetPassword = vi.fn()
const mockClearError = vi.fn()
const storeState = { isLoading: false, error: null as string | null }

vi.mock('~/layers/auth/app/composables/useAuthStore', () => ({
  useAuthStore: () => ({
    resetPassword: mockResetPassword,
    clearError: mockClearError,
    get isLoading() {
      return storeState.isLoading
    },
    get error() {
      return storeState.error
    }
  })
}))

function createWrapper() {
  return mount(AuthResetPasswordForm, {
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

describe('AuthResetPasswordForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    storeState.isLoading = false
    storeState.error = null
  })

  describe('estado inicial', () => {
    it('renderiza formulário (não estado de sucesso)', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.text()).toContain('Digite seu email cadastrado')
    })

    it('botão de submit inicia desabilitado', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const submitBtn = buttons.find(b => b.text().includes('Enviar'))

      expect(submitBtn?.attributes('disabled')).toBeDefined()
    })
  })

  describe('validação', () => {
    it('habilita submit com email válido', async () => {
      const wrapper = createWrapper()
      await wrapper.find('input').setValue('user@test.com')

      const buttons = wrapper.findAll('button')
      const submitBtn = buttons.find(b => b.text().includes('Enviar'))
      expect(submitBtn?.attributes('disabled')).toBeUndefined()
    })
  })

  describe('submit', () => {
    it('chama resetPassword e mostra sucesso', async () => {
      mockResetPassword.mockResolvedValue({ success: true, message: 'Email enviado!' })
      const wrapper = createWrapper()

      await wrapper.find('input').setValue('user@test.com')
      await wrapper.find('form').trigger('submit')

      expect(mockResetPassword).toHaveBeenCalledWith({ email: 'user@test.com' })
      expect(wrapper.text()).toContain('Email enviado!')
    })

    it('mantém formulário quando resetPassword falha', async () => {
      mockResetPassword.mockResolvedValue({ success: false })
      const wrapper = createWrapper()

      await wrapper.find('input').setValue('user@test.com')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.find('form').exists()).toBe(true)
    })
  })

  describe('state machine (form → submitted)', () => {
    it('exibe estado de sucesso após submit bem-sucedido', async () => {
      mockResetPassword.mockResolvedValue({
        success: true,
        message: 'Verifique sua caixa de entrada'
      })
      const wrapper = createWrapper()

      await wrapper.find('input').setValue('user@test.com')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.find('form').exists()).toBe(false)
      expect(wrapper.text()).toContain('Verifique sua caixa de entrada')
    })

    it('permite enviar para outro email (resetForm)', async () => {
      mockResetPassword.mockResolvedValue({ success: true, message: 'Ok' })
      const wrapper = createWrapper()

      await wrapper.find('input').setValue('user@test.com')
      await wrapper.find('form').trigger('submit')

      // Agora está no estado de sucesso, clicar em "Enviar para outro email"
      const resetBtn = wrapper.findAll('button').find(b => b.text().includes('outro email'))
      await resetBtn?.trigger('click')

      // Volta para o formulário
      expect(wrapper.find('form').exists()).toBe(true)
      expect(mockClearError).toHaveBeenCalled()
    })
  })
})
