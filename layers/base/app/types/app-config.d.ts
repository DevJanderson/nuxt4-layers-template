export interface NavItem {
  label: string
  to: string
  icon: string
}

export interface SocialLink {
  icon: string
  href: string
  label: string
}

export interface FooterLink {
  label: string
  to: string
  disabled?: boolean
}

export interface BrandConfig {
  logo: {
    default: string
    light: string
  }
}

export interface FooterConfig {
  copyright: string
  address: string
  social: SocialLink[]
  links: FooterLink[]
}

export interface SiteConfig {
  defaultLocale: string
  supportedLocales: string[]
}

declare module 'nuxt/schema' {
  interface AppConfigInput {
    site?: Partial<SiteConfig>
    brand?: BrandConfig
    nav?: NavItem[]
    footer?: FooterConfig
  }

  interface AppConfig {
    site: SiteConfig
    brand: BrandConfig
    nav: NavItem[]
    footer: FooterConfig
  }
}
