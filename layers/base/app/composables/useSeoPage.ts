import type { SeoPageOptions } from '../types'

/**
 * Converte locale BCP-47 (pt-BR) para formato Open Graph (pt_BR).
 * OG exige underscore; html lang mantém hífen.
 */
function toOgLocale(locale: string): string {
  return locale.replaceAll('-', '_')
}

/**
 * Composable para SEO de página.
 * Gera: title, description, og:*, twitter:*, canonical, html[lang].
 * Locale default vem de app.config.ts (site.defaultLocale).
 * Robots controlado via routeRules no nuxt.config.ts.
 */
export function useSeoPage(options: SeoPageOptions) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const appConfig = useAppConfig()

  const siteUrl = config.public.siteUrl as string
  const siteName = (config.public.siteName as string) || 'Meu Projeto'
  const defaultDescription = (config.public.siteDescription as string) || ''
  const locale = options.locale ?? appConfig.site.defaultLocale
  const path = options.path ?? route.path
  const canonical = `${siteUrl}${path}`
  const description = options.description ?? defaultDescription
  const ogImage = options.ogImage ?? `${siteUrl}/og-image.png`

  useHead({
    htmlAttrs: { lang: locale },
    link: [{ rel: 'canonical', href: canonical }]
  })

  useSeoMeta({
    title: options.title,
    description,
    ogType: 'website',
    ogTitle: options.title,
    ogDescription: description,
    ogUrl: canonical,
    ogImage,
    ogSiteName: siteName,
    ogLocale: toOgLocale(locale),
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: description,
    twitterImage: ogImage
  })
}
