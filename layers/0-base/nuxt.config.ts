/**
 * Layer 0-base: Fundação + UI
 * Contém app.vue, error.vue, CSS global, componentes shadcn-vue, utils e tipos
 */
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  css: [resolve('./app/assets/css/main.css')],

  alias: {
    '#shared': resolve('./shared')
  }
})
