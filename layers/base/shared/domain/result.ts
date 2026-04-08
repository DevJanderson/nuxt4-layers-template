/**
 * Result — tipo leve para tratamento de erros sem exceções
 *
 * Discriminated union em vez de classe. Idiomático em TypeScript,
 * sem herança, sem métodos — apenas funções puras.
 *
 * Usado em Value Objects (tryCreate) e validação client+server.
 */

/** Resultado de sucesso */
export interface Ok<T> {
  readonly ok: true
  readonly value: T
}

/** Resultado de falha */
export interface Fail<E = string> {
  readonly ok: false
  readonly error: E
}

/** Resultado que pode ser sucesso ou falha */
export type Result<T, E = string> = Ok<T> | Fail<E>

/** Cria um Result de sucesso */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

/** Cria um Result de falha */
export function fail<E = string>(error: E): Result<never, E> {
  return { ok: false, error }
}

/** Combina múltiplos Results — falha se qualquer um falhar */
export function combineResults<E = string>(results: Result<unknown, E>[]): Result<void, E[]> {
  const errors: E[] = []
  for (const r of results) {
    if (!r.ok) errors.push(r.error)
  }
  return errors.length ? { ok: false, error: errors } : { ok: true, value: undefined }
}

/** Extrai o valor de um Result ou lança o erro */
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.value
  throw new Error(result.error)
}

/** Extrai o valor de um Result ou retorna o fallback */
export function unwrapOr<T>(result: Result<T>, fallback: T): T {
  return result.ok ? result.value : fallback
}
