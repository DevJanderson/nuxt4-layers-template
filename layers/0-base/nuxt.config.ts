/**
 * Layer 0-base: Fundação + UI
 * Contém app.vue, error.vue, CSS global, componentes shadcn-vue, utils e tipos
 */
export default defineNuxtConfig({
  css: ['~/layers/0-base/app/assets/css/main.css'],

  alias: {
    '#shared': '../layers/0-base/shared'
  }
})
