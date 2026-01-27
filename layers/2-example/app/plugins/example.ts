/**
 * Plugin específico da Feature Layer
 *
 * Plugins executam uma vez quando a aplicação inicia.
 * Use para:
 * - Registrar bibliotecas de terceiros
 * - Injetar helpers globais
 * - Configurar integrações (analytics, error tracking)
 *
 * Convenções:
 * - .client.ts → executa apenas no cliente
 * - .server.ts → executa apenas no servidor
 * - .ts → executa em ambos
 */
export default defineNuxtPlugin((_nuxtApp) => {
  // Exemplo: injetar helper global
  // nuxtApp.provide('exampleHelper', {
  //   format: (value: string) => value.toUpperCase()
  // })

  // Exemplo: hook no ciclo de vida
  // nuxtApp.hook('app:mounted', () => {
  //   console.log('App mounted - Example plugin')
  // })

  // Exemplo: registrar diretiva
  // nuxtApp.vueApp.directive('example', {
  //   mounted(el) {
  //     el.style.border = '1px solid red'
  //   }
  // })
})
