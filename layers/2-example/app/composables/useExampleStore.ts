/**
 * Example Store
 * Pinia store para gerenciamento de estado do módulo
 * Usa Composition API para garantir contexto Nuxt correto
 */

import type { Example } from './types'

export const useExampleStore = defineStore('example', () => {
  // Estado
  const items = ref<Example[]>([])
  const current = ref<Example | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // API instanciada no contexto de setup
  const api = useExampleApi()

  // Getters como computed
  const hasItems = computed(() => items.value.length > 0)
  const itemCount = computed(() => items.value.length)

  // Actions
  async function fetchAll() {
    isLoading.value = true
    error.value = null

    try {
      items.value = await api.getAll()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar dados'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    isLoading.value = true
    error.value = null

    try {
      current.value = await api.getById(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar dados'
    } finally {
      isLoading.value = false
    }
  }

  function clearCurrent() {
    current.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    // Estado
    items,
    current,
    isLoading,
    error,
    // Getters
    hasItems,
    itemCount,
    // Actions
    fetchAll,
    fetchById,
    clearCurrent,
    clearError
  }
})
