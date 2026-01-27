import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

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
      title: 'Nuxt 4 Layers Template',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Template profissional para Nuxt 4 com shadcn-vue, Tailwind CSS v4 e arquitetura de Layers.' },
        { name: 'theme-color', content: '#000000' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Desabilita sourcemaps em produção (evita warning do @tailwindcss/vite)
  sourcemap: {
    client: false,
    server: false
  },

  // Nuxt Layers - auto-scan de ~/layers (Nuxt 4+)
  // Ordem de prioridade: 4-landing > 2-example > 1-base

  modules: [
    '@nuxt/eslint',
    'shadcn-nuxt',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@nuxt/image',
    '@nuxtjs/color-mode'
  ],

  // VeeValidate - validação de formulários
  veeValidate: {
    autoImports: true,
    componentNames: {
      Form: 'VeeForm',
      Field: 'VeeField',
      FieldArray: 'VeeFieldArray',
      ErrorMessage: 'VeeErrorMessage'
    }
  },

  // Color Mode - dark/light mode
  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light'
  },

  // Nuxt Image - otimização de imagens
  image: {
    quality: 80,
    format: ['webp', 'avif']
  },

  shadcn: {
    prefix: '',
    componentDir: './layers/1-base/app/components/ui'
  },

  runtimeConfig: {
    // Public (exposed to client)
    public: {
      apiBaseUrl: import.meta.env.API_BASE_URL || '/api',
    }
  },

  vite: {
    plugins: [tailwindcss()],

    // Performance - Build optimizations
    build: {
      // Minificação rápida
      minify: 'esbuild',
      // Limite para inline de assets (4kb)
      assetsInlineLimit: 4096
    }
  },

  css: ['~/assets/css/main.css']
})