/**
 * Utilitários específicos da Feature Layer
 *
 * Utils são funções PURAS (sem estado reativo).
 * Para lógica com estado, use composables.
 *
 * Funções em app/utils/ são auto-importadas.
 */

/**
 * Formata um ID de exemplo para exibição
 */
export function formatExampleId(id: string): string {
  return `EX-${id.slice(0, 8).toUpperCase()}`
}

/**
 * Valida se um nome de exemplo é válido
 */
export function isValidExampleName(name: string): boolean {
  return name.length >= 3 && name.length <= 100
}

/**
 * Gera um slug a partir do nome
 */
export function generateExampleSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
