/// <reference types="vitest/globals" />
/**
 * Vitest Setup - Projeto "nuxt"
 * Executado antes dos testes em tests/integration/
 * No ambiente @nuxt/test-utils, auto-imports reais do Nuxt estão disponíveis.
 */
import { config } from '@vue/test-utils'

// Stubs de componentes Nuxt para evitar warnings
config.global.stubs = {
  NuxtLink: {
    template: '<a><slot /></a>'
  },
  ClientOnly: {
    template: '<slot />'
  },
  NuxtImg: {
    template: '<img />'
  },
  Icon: {
    template: '<span />'
  }
}

// Mock do @nuxtjs/color-mode para evitar erro de inicialização nos testes
// O plugin.client.js acessa window.__NUXT_COLOR_MODE__ antes do app inicializar.
// Sem isso: "Cannot read properties of undefined (reading 'preference')"
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__NUXT_COLOR_MODE__ = {
    preference: 'light',
    value: 'light',
    getColorScheme: () => 'light',
    addColorScheme: () => {},
    removeColorScheme: () => {}
  }
}

vi.stubGlobal('useColorMode', () => ({
  preference: 'light',
  value: 'light',
  forced: false
}))

// Suprimir apenas warnings conhecidos e irrelevantes em testes
config.global.config.warnHandler = (msg: string) => {
  const suppressed = ['Transition', 'teleport', 'color-mode']
  if (suppressed.some(s => msg.toLowerCase().includes(s))) return
  console.warn('[Vue warn]', msg)
}
