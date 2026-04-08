import type { SeoPageOptions } from '../types'

/**
 * Composable para SEO de página.
 * Gera: title, description, og:*, twitter:*, canonical.
 * Robots controlado via routeRules no nuxt.config.ts.
 */
export function useSeoPage(options: SeoPageOptions) {
  const route = useRoute()
  const config = useRuntimeConfig()

  const siteUrl = config.public.siteUrl as string
  const siteName = (config.public.siteName as string) || 'Meu Projeto'
  const defaultDescription = (config.public.siteDescription as string) || ''
  const path = options.path ?? route.path
  const canonical = `${siteUrl}${path}`
  const description = options.description ?? defaultDescription
  const ogImage = options.ogImage ?? `${siteUrl}/og-image.png`

  useHead({ link: [{ rel: 'canonical', href: canonical }] })

  useSeoMeta({
    title: options.title,
    description,
    ogType: 'website',
    ogTitle: options.title,
    ogDescription: description,
    ogUrl: canonical,
    ogImage,
    ogSiteName: siteName,
    ogLocale: 'pt_BR',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: description,
    twitterImage: ogImage
  })
}
