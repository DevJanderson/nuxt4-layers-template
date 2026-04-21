/**
 * Defaults da layer base. O `app.config.ts` da raiz sobrescreve
 * estes valores — mantenha ambos sincronizados ao adicionar campos.
 */
export default defineAppConfig({
  site: {
    defaultLocale: 'pt-BR',
    supportedLocales: ['pt-BR']
  },
  brand: {
    logo: {
      default: '/logo.svg',
      light: '/logo-light.svg'
    }
  },
  nav: [],
  footer: {
    copyright: '',
    address: '',
    social: [],
    links: []
  }
})
