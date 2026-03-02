/**
 * Vitest Global Setup
 * Este arquivo é executado antes de todos os testes
 */
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock global do Nuxt
vi.mock('#app', () => ({
  defineNuxtPlugin: vi.fn(plugin => plugin),
  useNuxtApp: () => ({
    $pinia: {},
    callHook: vi.fn()
  }),
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: 'http://localhost:3000/api'
    }
  }),
  navigateTo: vi.fn(),
  useFetch: vi.fn(),
  useAsyncData: vi.fn(),
  useCookie: vi.fn(() => ({ value: null })),
  useRoute: vi.fn(() => ({
    params: {},
    query: {},
    path: '/'
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  })),
  defineNuxtRouteMiddleware: vi.fn(middleware => middleware),
  abortNavigation: vi.fn(),
  setPageLayout: vi.fn(),
  useState: vi.fn((_key, init) => ({ value: init ? init() : undefined })),
  clearNuxtState: vi.fn(),
  refreshNuxtData: vi.fn(),
  clearNuxtData: vi.fn()
}))

// Configuração global do Vue Test Utils
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

// Suppress Vue warnings in tests (optional)
config.global.config.warnHandler = () => {}
