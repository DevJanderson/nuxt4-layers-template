/**
 * Testes de integração para useSeoPage
 * Roda com @nuxt/test-utils (projeto "nuxt") - auto-imports reais disponíveis
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const TEST_SITE_URL = 'http://localhost:3000'
const TEST_SITE_NAME = 'Meu Projeto'
const TEST_SITE_DESCRIPTION = 'Descricao do projeto'

// Mock dos composables de head via @nuxt/test-utils
const mockUseHead = vi.fn()
const mockUseSeoMeta = vi.fn()

mockNuxtImport(
  'useHead',
  () =>
    (...args: unknown[]) =>
      mockUseHead(...args)
)
mockNuxtImport(
  'useSeoMeta',
  () =>
    (...args: unknown[]) =>
      mockUseSeoMeta(...args)
)
mockNuxtImport('useRoute', () => () => ({ path: '/' }))
mockNuxtImport('useRuntimeConfig', () => () => ({
  public: {
    siteUrl: TEST_SITE_URL,
    siteName: TEST_SITE_NAME,
    siteDescription: TEST_SITE_DESCRIPTION
  }
}))

const { useSeoPage } = await import('~/layers/base/app/composables/useSeoPage')

describe('useSeoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('configuração básica', () => {
    it('deve definir title e description padrão', () => {
      useSeoPage({ title: 'Minha Página' })

      expect(mockUseSeoMeta).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Minha Página',
          description: TEST_SITE_DESCRIPTION
        })
      )
    })

    it('deve usar description customizada quando fornecida', () => {
      useSeoPage({
        title: 'Teste',
        description: 'Descrição customizada'
      })

      expect(mockUseSeoMeta).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Descrição customizada',
          ogDescription: 'Descrição customizada',
          twitterDescription: 'Descrição customizada'
        })
      )
    })
  })

  describe('canonical URL', () => {
    it('deve gerar canonical usando rota atual', () => {
      useSeoPage({ title: 'Teste' })

      expect(mockUseHead).toHaveBeenCalledWith({
        link: [{ rel: 'canonical', href: `${TEST_SITE_URL}/` }]
      })
    })

    it('deve aceitar path customizado', () => {
      useSeoPage({ title: 'Teste', path: '/custom-path' })

      expect(mockUseHead).toHaveBeenCalledWith({
        link: [{ rel: 'canonical', href: `${TEST_SITE_URL}/custom-path` }]
      })
    })
  })

  describe('Open Graph', () => {
    it('deve definir meta tags OG completas', () => {
      useSeoPage({ title: 'Teste OG' })

      expect(mockUseSeoMeta).toHaveBeenCalledWith(
        expect.objectContaining({
          ogType: 'website',
          ogTitle: 'Teste OG',
          ogUrl: `${TEST_SITE_URL}/`,
          ogImage: `${TEST_SITE_URL}/og-image.png`,
          ogSiteName: TEST_SITE_NAME,
          ogLocale: 'pt_BR'
        })
      )
    })

    it('deve aceitar ogImage customizada', () => {
      useSeoPage({
        title: 'Teste',
        ogImage: 'https://cdn.example.com/custom-image.png'
      })

      expect(mockUseSeoMeta).toHaveBeenCalledWith(
        expect.objectContaining({
          ogImage: 'https://cdn.example.com/custom-image.png'
        })
      )
    })
  })

  describe('Twitter Cards', () => {
    it('deve definir meta tags Twitter completas', () => {
      useSeoPage({
        title: 'Teste Twitter',
        description: 'Desc twitter'
      })

      expect(mockUseSeoMeta).toHaveBeenCalledWith(
        expect.objectContaining({
          twitterCard: 'summary_large_image',
          twitterTitle: 'Teste Twitter',
          twitterDescription: 'Desc twitter',
          twitterImage: `${TEST_SITE_URL}/og-image.png`
        })
      )
    })
  })
})
