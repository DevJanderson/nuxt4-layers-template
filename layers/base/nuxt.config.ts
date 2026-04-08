/**
 * Layer Base - Configuração
 * Fundação da aplicação: Tailwind CSS, paleta da marca, componentes
 * shadcn-vue, app.vue, error.vue, composables, utilitários e tipos
 * compartilhados entre todos os layers.
 */
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  css: [resolve('./app/assets/css/main.css')],
  alias: {
    '#shared': resolve('./shared')
  }
})
