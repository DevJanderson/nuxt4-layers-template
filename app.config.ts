import type {
  NavItem,
  SocialLink,
  FooterLink,
  SiteConfig
} from './layers/base/app/types/app-config'

export default defineAppConfig({
  site: {
    defaultLocale: 'pt-BR',
    supportedLocales: ['pt-BR']
  } satisfies SiteConfig,
  brand: {
    logo: {
      default: '/brand/logo-default.svg',
      light: '/brand/logo-light.svg'
    }
  },
  nav: [{ label: 'início', to: '/', icon: 'lucide:house' }] satisfies NavItem[],
  footer: {
    copyright: '© {year} Sua Empresa',
    address: '',
    social: [] satisfies SocialLink[],
    links: [] satisfies FooterLink[]
  }
})
