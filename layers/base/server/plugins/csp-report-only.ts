/**
 * Nitro Plugin - CSP Report-Only (nonce-based)
 *
 * Adiciona header Content-Security-Policy-Report-Only com politica restritiva
 * usando nonce. O CSP principal (enforcing) permanece inalterado.
 *
 * Violacoes aparecem como warnings no console do navegador, sem bloquear nada.
 * Quando validado em staging sem violacoes, promover para CSP principal.
 *
 * Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only
 */
export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('render:response', (_response, { event }) => {
    // Apenas em producao/staging (em dev o CSP esta desabilitado)
    if (import.meta.dev) return

    const nonce = event.context.security?.nonce
    if (!nonce) return

    const directives = [
      "default-src 'self'",
      `script-src 'self' 'strict-dynamic' 'nonce-${nonce}'`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.iconify.design",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "base-uri 'self'"
    ]

    setResponseHeader(event, 'Content-Security-Policy-Report-Only', directives.join('; '))
  })
})
