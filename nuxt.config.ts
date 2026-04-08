import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },

  // Performance - Experimental features
  experimental: {
    crossOriginPrefetch: true
  },

  // Performance - Nitro (servidor)
  nitro: {
    compressPublicAssets: true
  },

  // SEO - Meta tags globais
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },

  // Desabilita sourcemaps em produção (evita warning do @tailwindcss/vite)
  sourcemap: {
    client: false,
    server: false
  },

  // Nuxt Layers - extends explícito (ordem = prioridade crescente)
  extends: ['./layers/base', './layers/auth', './layers/home'],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: process.env.NUXT_PUBLIC_SITE_NAME || 'Meu Projeto',
    defaultLocale: 'pt-BR'
  },

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light'
  },

  ogImage: { enabled: false },
  linkChecker: { enabled: false },
  seo: {
    // Desabilitar tree-shaking de useSeoMeta em testes (Vitest)
    // para que mocks de useSeoMeta funcionem corretamente
    treeShakeUseSeoMeta: !process.env.VITEST
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    'shadcn-nuxt',
    '@pinia/nuxt',
    '@nuxt/image',
    'nuxt-security',
    ['vue-sonner/nuxt', { css: false }],
    '@nuxtjs/seo',
    '@nuxtjs/color-mode',
    'pinia-plugin-persistedstate/nuxt'
  ],

  robots: {
    disallow: ['/api/', '/auth/']
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: process.env.NUXT_PUBLIC_SITE_NAME || 'Meu Projeto',
      url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  // Nuxt Icon - auto-import de ícones
  // Docs: https://nuxt.com/modules/icon
  icon: {
    serverBundle: 'remote',
    clientBundle: {
      scan: true,
      // Ícones escaneados automaticamente; aumentar limite se necessário
      sizeLimitKb: 256
    }
  },

  // Security - nuxt-security (headers, rate limiter, CSRF, etc.)
  // Docs: https://nuxt-security.vercel.app
  security: {
    // Headers de segurança
    headers: {
      crossOriginResourcePolicy: 'same-origin',
      crossOriginOpenerPolicy: 'same-origin',
      // unsafe-none: não usamos SharedArrayBuffer e 'credentialless' quebra
      // extensões de navegador (Bitwarden, 1Password) que injetam iframes
      crossOriginEmbedderPolicy: 'unsafe-none',
      // CSP desabilitado em dev (interfere com HMR do Vite ao acessar via rede)
      // Ref: https://nuxt-security.vercel.app/advanced/faq
      contentSecurityPolicy:
        process.env.NODE_ENV === 'development'
          ? false
          : {
              'base-uri': ["'self'"],
              'default-src': ["'self'"],
              // nonce substitui 'unsafe-inline'
              'script-src': ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'"],
              'style-src': ["'self'", "'unsafe-inline'"],
              'img-src': ["'self'", 'data:', 'https:'],
              'font-src': ["'self'", 'data:'],
              'connect-src': ["'self'", 'https://api.iconify.design'],
              // Permite iframes de extensões do navegador (Bitwarden, 1Password, etc.)
              'frame-src': ["'self'", 'chrome-extension:', 'moz-extension:'],
              'frame-ancestors': ["'self'"],
              'form-action': ["'self'"],
              'object-src': ["'none'"],
              'upgrade-insecure-requests': true
            },
      // Permissions-Policy: restringe features do navegador não utilizadas
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: ['self'],
        'display-capture': []
      },
      referrerPolicy: 'strict-origin-when-cross-origin',
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true
      },
      xContentTypeOptions: 'nosniff',
      xFrameOptions: 'SAMEORIGIN',
      xXSSProtection: '0' // Desabilitado (obsoleto, CSP é suficiente)
    },

    // Rate limiter - desabilitado em dev, 150 req/5min em produção
    rateLimiter:
      process.env.NODE_ENV === 'development' ? false : { tokensPerInterval: 150, interval: 300000 },

    // Limite de tamanho de requisição
    requestSizeLimiter: {
      maxRequestSizeInBytes: 2000000, // 2MB
      maxUploadFileRequestInBytes: 8000000 // 8MB
    },

    // XSS Validator (objeto vazio = usar defaults)
    xssValidator: {},

    // Oculta header X-Powered-By
    hidePoweredBy: true,

    // Habilita nonce para CSP (necessário para Report-Only nonce-based)
    nonce: true,

    // CSRF Protection (usa nuxt-csurf internamente)
    csrf: {
      https: process.env.NODE_ENV === 'production',
      cookieKey: 'csrf',
      methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE']
    }
  },

  // Configurações por rota
  // Docs: https://nuxt-security.vercel.app/getting-started/usage
  routeRules: {
    // Rotas de auth: CSRF desabilitado (usam cookies httpOnly)
    '/api/auth/login': {
      security: { rateLimiter: { tokensPerInterval: 10, interval: 300000 } },
      csurf: false
    },
    '/api/auth/logout': { csurf: false },
    '/api/auth/refresh': {
      csurf: false,
      security: { rateLimiter: { tokensPerInterval: 10, interval: 300000 } }
    },
    '/api/auth/reset-password': {
      security: { rateLimiter: { tokensPerInterval: 5, interval: 300000 } },
      csurf: false
    },
    '/api/auth/signup': {
      security: { rateLimiter: { tokensPerInterval: 5, interval: 300000 } },
      csurf: false
    },

    // SEO: robots noindex para rotas internas (header X-Robots-Tag)
    '/auth/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/perfil/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/admin/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } }
  },

  // Nuxt Image - otimização de imagens
  image: {
    quality: 80,
    format: ['webp', 'avif']
  },

  shadcn: {
    prefix: '',
    componentDir: './layers/base/app/components/ui'
  },

  runtimeConfig: {
    // Private (server only)
    apiBaseUrl: '', // NUXT_API_BASE_URL

    // Public (exposed to client)
    public: {
      apiBaseUrl: '', // NUXT_PUBLIC_API_BASE_URL
      siteUrl: '', // NUXT_PUBLIC_SITE_URL
      siteName: '', // NUXT_PUBLIC_SITE_NAME
      siteDescription: '' // NUXT_PUBLIC_SITE_DESCRIPTION
    }
  },

  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @tailwindcss/vite type mismatch with Nuxt's bundled vite types
    plugins: [tailwindcss() as any],

    // Pré-bundlar dependências pesadas (transforma uma vez, reutiliza)
    optimizeDeps: {
      include: [
        'reka-ui',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'lucide-vue-next',
        '@vueuse/core',
        'zod'
      ]
    },

    // Performance - Build optimizations
    build: {
      // Minificação rápida
      minify: 'esbuild',
      // Limite para inline de assets (4kb)
      assetsInlineLimit: 4096
    }
  }
})
