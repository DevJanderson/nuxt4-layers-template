/**
 * Formata data ISO para pt-BR com dia, mês, ano, hora e minuto
 * Retorna '--' se a data for nula/undefined
 */
export function formatDate(date?: string | null): string {
  if (!date) return '--'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
