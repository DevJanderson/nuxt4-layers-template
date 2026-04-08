/**
 * Utilitários de autenticação (client-side)
 */

/** Rotas de autenticação centralizadas */
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  RESET_PASSWORD: '/auth/reset-password'
} as const

/**
 * Valida se uma URL de redirect é segura (apenas URLs relativas internas)
 * Previne ataques de Open Redirect
 *
 * @param url - URL a ser validada
 * @returns true se a URL é segura para redirect
 */
export function isValidRedirectUrl(url: string): boolean {
  // Deve começar com / (relativa)
  if (!url.startsWith('/')) {
    return false
  }

  // Não pode conter // (previne //evil.com)
  if (url.includes('//')) {
    return false
  }

  // Não pode conter protocolo
  if (url.includes(':')) {
    return false
  }

  // Não pode ter @ (previne //@evil.com)
  if (url.includes('@')) {
    return false
  }

  return true
}

/**
 * Retorna URL de redirect segura ou fallback
 *
 * @param url - URL a ser validada
 * @param fallback - URL padrão se a original for inválida (default: '/')
 * @returns URL segura
 */
export function getSafeRedirectUrl(url: string | undefined | null, fallback: string = '/'): string {
  if (!url) {
    return fallback
  }

  return isValidRedirectUrl(url) ? url : fallback
}
