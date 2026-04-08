/**
 * Testes unitários para withStoreAction
 * Roda em Node puro (projeto "unit") - sem Nuxt
 */
import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'

import { withStoreAction } from '~/layers/base/app/utils/store-helpers'

function createRefs() {
  return {
    isLoading: ref(false),
    error: ref<string | null>(null)
  }
}

// Mock extractErrorMessage (auto-importado no Nuxt, precisa ser importado aqui)
vi.mock('~/layers/base/app/utils/error', () => ({
  extractErrorMessage: (error: unknown, defaultMessage: string) => {
    if (error && typeof error === 'object' && 'data' in error) {
      const e = error as { data?: { message?: string } }
      if (e.data?.message) return e.data.message
    }
    return defaultMessage
  }
}))

describe('withStoreAction', () => {
  describe('ciclo de vida (isLoading / error)', () => {
    it('seta isLoading=true durante execução e false ao finalizar', async () => {
      const refs = createRefs()
      let loadingDuringExec = false

      await withStoreAction(refs, 'Erro', async () => {
        loadingDuringExec = refs.isLoading.value
      })

      expect(loadingDuringExec).toBe(true)
      expect(refs.isLoading.value).toBe(false)
    })

    it('limpa error antes de executar', async () => {
      const refs = createRefs()
      refs.error.value = 'erro anterior'

      await withStoreAction(refs, 'Erro', async () => {})

      expect(refs.error.value).toBeNull()
    })

    it('seta isLoading=false mesmo quando fn lança erro', async () => {
      const refs = createRefs()

      await withStoreAction(refs, 'Erro', async () => {
        throw new Error('falhou')
      })

      expect(refs.isLoading.value).toBe(false)
    })
  })

  describe('retorno de valor', () => {
    it('retorna o valor da fn quando sucesso', async () => {
      const refs = createRefs()

      const result = await withStoreAction(refs, 'Erro', async () => 42)

      expect(result).toBe(42)
    })

    it('retorna undefined quando fn falha (sem defaultValue)', async () => {
      const refs = createRefs()

      const result = await withStoreAction(refs, 'Erro', async () => {
        throw new Error('falhou')
      })

      expect(result).toBeUndefined()
    })

    it('retorna defaultValue quando fn falha (com defaultValue)', async () => {
      const refs = createRefs()

      const result = await withStoreAction(
        refs,
        'Erro',
        async () => {
          throw new Error('falhou')
          return true // tipo inferido como boolean
        },
        false
      )

      expect(result).toBe(false)
    })

    it('retorna defaultValue numérico quando fn falha', async () => {
      const refs = createRefs()

      const result = await withStoreAction(
        refs,
        'Erro',
        async (): Promise<number> => {
          throw new Error('falhou')
        },
        -1
      )

      expect(result).toBe(-1)
    })
  })

  describe('tratamento de erro', () => {
    it('seta error com a mensagem padrão para erros genéricos', async () => {
      const refs = createRefs()

      await withStoreAction(refs, 'Erro ao salvar', async () => {
        throw new Error('network error')
      })

      expect(refs.error.value).toBe('Erro ao salvar')
    })

    it('extrai mensagem de FetchError (data.message)', async () => {
      const refs = createRefs()

      await withStoreAction(refs, 'Erro genérico', async () => {
        throw { statusCode: 422, data: { message: 'Email já cadastrado' } }
      })

      expect(refs.error.value).toBe('Email já cadastrado')
    })

    it('não propaga exceção (fn rejeitada não borbulha)', async () => {
      const refs = createRefs()

      await expect(
        withStoreAction(refs, 'Erro', async () => {
          throw new Error('falhou')
        })
      ).resolves.not.toThrow()
    })
  })

  describe('fn assíncrona', () => {
    it('aguarda fn completar antes de setar isLoading=false', async () => {
      const refs = createRefs()
      const order: string[] = []

      await withStoreAction(refs, 'Erro', async () => {
        order.push('fn-start')
        await new Promise(resolve => setTimeout(resolve, 10))
        order.push('fn-end')
      })

      order.push('after')
      expect(order).toEqual(['fn-start', 'fn-end', 'after'])
      expect(refs.isLoading.value).toBe(false)
    })
  })
})
