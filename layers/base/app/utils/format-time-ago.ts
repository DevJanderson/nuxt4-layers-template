/** Formata uma data como tempo relativo em pt-BR (ex: "Há 4h", "Ontem", "Há 3 dias") */
export function formatTimeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Agora'
  if (diffHours < 24) return `Há ${diffHours}h`
  if (diffDays === 1) return 'Ontem'
  return `Há ${diffDays} dias`
}
