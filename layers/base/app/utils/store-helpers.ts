import type { Ref } from 'vue'
import { extractErrorMessage } from './error'

interface StoreRefs {
  isLoading: Ref<boolean>
  error: Ref<string | null>
}

/**
 * Wrapper para ações de store que eliminam o boilerplate repetido de
 * isLoading / error / try-catch-finally.
 *
 * Com defaultValue: retorna T (nunca undefined)
 * Sem defaultValue: retorna T | undefined
 *
 * @example
 * // Retorna boolean (false em caso de erro)
 * async function criar(data: CreateData): Promise<boolean> {
 *   return withStoreAction(refs, 'Erro ao criar', async () => {
 *     await api.criar(data)
 *     return true
 *   }, false)
 * }
 *
 * // Retorna void | undefined (sem defaultValue)
 * async function fetchAll(): Promise<void> {
 *   return withStoreAction(refs, 'Erro ao listar', async () => {
 *     items.value = await api.listar()
 *   })
 * }
 */
export async function withStoreAction<T>(
  refs: StoreRefs,
  errorMessage: string,
  fn: () => Promise<T>,
  defaultValue: T
): Promise<T>
export async function withStoreAction<T>(
  refs: StoreRefs,
  errorMessage: string,
  fn: () => Promise<T>
): Promise<T | undefined>
export async function withStoreAction<T>(
  refs: StoreRefs,
  errorMessage: string,
  fn: () => Promise<T>,
  defaultValue?: T
): Promise<T | undefined> {
  refs.isLoading.value = true
  refs.error.value = null
  try {
    return await fn()
  } catch (e: unknown) {
    refs.error.value = extractErrorMessage(e, errorMessage)
    return defaultValue
  } finally {
    refs.isLoading.value = false
  }
}
