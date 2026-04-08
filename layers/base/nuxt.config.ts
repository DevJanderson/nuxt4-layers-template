/**
 * Layer Base - Configuração
 * Fundação da aplicação: Tailwind CSS, paleta da marca, componentes
 * shadcn-vue, app.vue, error.vue, composables, utilitários e tipos
 * compartilhados entre todos os layers.
 */
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const dir = fileURLToPath(new URL('.', import.meta.url))

export default defineNuxtConfig({
  css: [resolve(dir, './app/assets/css/main.css')],
  alias: {
    '#shared': resolve(dir, './shared')
  }
})
