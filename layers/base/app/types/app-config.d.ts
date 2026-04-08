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

declare module 'nuxt/schema' {
  interface AppConfigInput {
    brand?: BrandConfig
    nav?: NavItem[]
    footer?: FooterConfig
  }

  interface AppConfig {
    brand: BrandConfig
    nav: NavItem[]
    footer: FooterConfig
  }
}
