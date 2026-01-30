/**
 * Example API Service
 * Composable para comunicação com a API
 */

import type { Example, CreateExampleData, UpdateExampleData } from './types'

export function useExampleApi() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl

  /**
   * Busca todos os examples
   */
  async function getAll(): Promise<Example[]> {
    return $fetch<Example[]>(`${baseUrl}/examples`)
  }

  /**
   * Busca um example por ID
   */
  async function getById(id: string): Promise<Example> {
    return $fetch<Example>(`${baseUrl}/examples/${id}`)
  }

  /**
   * Cria um novo example
   */
  async function create(data: CreateExampleData): Promise<Example> {
    return $fetch<Example>(`${baseUrl}/examples`, {
      method: 'POST',
      body: data
    })
  }

  /**
   * Atualiza um example
   */
  async function update(id: string, data: UpdateExampleData): Promise<Example> {
    return $fetch<Example>(`${baseUrl}/examples/${id}`, {
      method: 'PATCH',
      body: data
    })
  }

  /**
   * Remove um example
   */
  async function remove(id: string): Promise<void> {
    await $fetch(`${baseUrl}/examples/${id}`, {
      method: 'DELETE'
    })
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove
  }
}
