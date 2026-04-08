/**
 * Escapa caracteres HTML especiais para prevenir XSS em innerHTML.
 * Usado em popups/badges do Leaflet que interpolam dados da API.
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, ch => HTML_ENTITIES[ch]!)
}
