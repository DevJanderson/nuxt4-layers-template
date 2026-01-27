# PERFORMANCE.md

Guia de otimização de performance para aplicações Nuxt 4.

## Índice

1. [Análise de Performance](#análise-de-performance)
2. [Lazy Loading](#lazy-loading)
3. [Code Splitting](#code-splitting)
4. [Otimização de Imagens](#otimização-de-imagens)
5. [SSR vs SSG vs SPA](#ssr-vs-ssg-vs-spa)
6. [Caching](#caching)
7. [Bundle Optimization](#bundle-optimization)
8. [Runtime Performance](#runtime-performance)
9. [Métricas Core Web Vitals](#métricas-core-web-vitals)
10. [Checklist de Performance](#checklist-de-performance)

---

## Análise de Performance

### Ferramentas de Diagnóstico

```bash
# Analisar bundle
npx nuxi analyze

# Build com relatório
npm run build -- --analyze
```

### Lighthouse no Chrome DevTools

1. Abrir DevTools (F12)
2. Aba "Lighthouse"
3. Selecionar "Performance"
4. Gerar relatório

### Métricas Importantes

| Métrica | Bom | Precisa Melhorar | Ruim |
|---------|-----|------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4s | > 4s |
| FID (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| TTFB (Time to First Byte) | < 800ms | 800ms - 1.8s | > 1.8s |

---

## Lazy Loading

### Componentes

```vue
<!-- ✅ Lazy load de componente pesado -->
<script setup>
// Carrega apenas quando necessário
const HeavyChart = defineAsyncComponent(() =>
  import('~/components/HeavyChart.vue')
)
</script>

<template>
  <Suspense>
    <HeavyChart />
    <template #fallback>
      <div>Carregando gráfico...</div>
    </template>
  </Suspense>
</template>
```

### Componentes com Nuxt

```vue
<!-- ✅ Lazy component do Nuxt (prefixo Lazy) -->
<template>
  <!-- Carrega apenas quando visível -->
  <LazyHeavyChart v-if="showChart" />
</template>
```

### Componentes Condicionais

```vue
<script setup>
// Não importa até que seja necessário
const Modal = defineAsyncComponent(() =>
  import('~/components/Modal.vue')
)

const showModal = ref(false)
</script>

<template>
  <!-- Modal só é carregado quando showModal = true -->
  <Modal v-if="showModal" @close="showModal = false" />
</template>
```

### Rotas/Páginas

Nuxt já faz lazy loading de páginas automaticamente.

```typescript
// nuxt.config.ts - Prefetch de páginas
export default defineNuxtConfig({
  experimental: {
    // Pré-carrega links visíveis
    crossOriginPrefetch: true
  },

  router: {
    options: {
      // Prefetch de links no viewport
      prefetchLinks: true
    }
  }
})
```

### Dados com useLazyFetch

```typescript
// Não bloqueia navegação
const { data, status } = await useLazyFetch('/api/heavy-data')

// Mostra loading enquanto carrega
<template>
  <div v-if="status === 'pending'">Carregando...</div>
  <div v-else>{{ data }}</div>
</template>
```

---

## Code Splitting

### Automático no Nuxt

Nuxt automaticamente faz code splitting de:
- Cada página
- Cada layout
- Componentes async

### Manual com Dynamic Imports

```typescript
// ❌ Importa tudo no bundle principal
import { heavyFunction } from '~/lib/heavy-lib'

// ✅ Importa apenas quando necessário
async function handleClick() {
  const { heavyFunction } = await import('~/lib/heavy-lib')
  heavyFunction()
}
```

### Bibliotecas Pesadas

```typescript
// ❌ ERRADO - Importa toda a biblioteca
import _ from 'lodash'
const result = _.debounce(fn, 300)

// ✅ CERTO - Importa apenas função necessária
import debounce from 'lodash/debounce'
const result = debounce(fn, 300)

// ✅ MELHOR - Usa alternativa mais leve
import { useDebounceFn } from '@vueuse/core'
const debouncedFn = useDebounceFn(fn, 300)
```

### Vendor Chunks

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar vendor chunks
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'ui-vendor': ['reka-ui', 'class-variance-authority']
          }
        }
      }
    }
  }
})
```

---

## Otimização de Imagens

### Módulo @nuxt/image

```bash
npm install @nuxt/image
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/image'],

  image: {
    // Qualidade padrão
    quality: 80,

    // Formatos modernos
    format: ['webp', 'avif'],

    // Tamanhos de tela
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },

    // Providers (Cloudinary, Imgix, etc.)
    providers: {
      cloudinary: {
        baseURL: 'https://res.cloudinary.com/your-account/image/upload/'
      }
    }
  }
})
```

### Componente NuxtImg

```vue
<template>
  <!-- ✅ Otimização automática -->
  <NuxtImg
    src="/images/hero.jpg"
    alt="Hero"
    width="1200"
    height="600"
    format="webp"
    quality="80"
    loading="lazy"
    placeholder
  />

  <!-- ✅ Responsivo -->
  <NuxtImg
    src="/images/product.jpg"
    sizes="sm:100vw md:50vw lg:400px"
    alt="Produto"
  />
</template>
```

### NuxtPicture (múltiplos formatos)

```vue
<template>
  <!-- Serve AVIF > WebP > JPEG -->
  <NuxtPicture
    src="/images/hero.jpg"
    alt="Hero"
    format="avif,webp,jpeg"
  />
</template>
```

### Lazy Loading Nativo

```vue
<template>
  <!-- loading="lazy" nativo do browser -->
  <img
    src="/image.jpg"
    alt="Descrição"
    loading="lazy"
    decoding="async"
  />
</template>
```

### Placeholder/Blur

```vue
<template>
  <!-- Mostra blur enquanto carrega -->
  <NuxtImg
    src="/images/large.jpg"
    placeholder="/images/large-blur.jpg"
    alt="Imagem grande"
  />
</template>
```

---

## SSR vs SSG vs SPA

### Quando Usar Cada Um

| Modo | Quando Usar | Performance |
|------|-------------|-------------|
| **SSR** | Conteúdo dinâmico, SEO importante | Melhor TTFB, LCP |
| **SSG** | Conteúdo estático, blogs, docs | Melhor performance geral |
| **SPA** | Dashboards, apps autenticados | Menor bundle inicial |

### Configurar SSG (Static Site Generation)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Gera site estático
  ssr: true,

  nitro: {
    prerender: {
      // Páginas para pré-renderizar
      routes: ['/'],
      // Descobrir links automaticamente
      crawlLinks: true
    }
  }
})
```

```bash
# Gerar site estático
npm run generate
```

### Configurar SPA

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false // Modo SPA
})
```

### Híbrido (Route Rules)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // SSG - Pré-renderizado
    '/': { prerender: true },
    '/blog/**': { prerender: true },

    // SSR - Renderizado no servidor
    '/dashboard/**': { ssr: true },

    // SPA - Apenas cliente
    '/admin/**': { ssr: false },

    // ISR - Regeneração incremental
    '/products/**': { isr: 3600 } // Revalida a cada 1h
  }
})
```

---

## Caching

### Cache de Dados

```typescript
// useFetch com cache
const { data } = await useFetch('/api/products', {
  // Cache por 5 minutos
  getCachedData(key, nuxtApp) {
    const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    if (data) return data

    // Ou usar localStorage/sessionStorage
    const cached = localStorage.getItem(key)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      // Cache válido por 5 minutos
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data
      }
    }
    return null
  }
})
```

### Cache de API (Nitro)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // Cache de API por 1 hora
    '/api/products': {
      cache: { maxAge: 3600 }
    },

    // Cache com stale-while-revalidate
    '/api/categories': {
      cache: {
        maxAge: 3600,
        staleMaxAge: 86400 // Serve stale por 24h enquanto revalida
      }
    }
  }
})
```

### Cache Headers

```typescript
// server/api/products.get.ts
export default defineEventHandler((event) => {
  // Cache no browser e CDN
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=86400')

  return getProducts()
})
```

### Service Worker (PWA)

```bash
npm install -D @vite-pwa/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],

  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      // Cache de assets
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      // Cache de API
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.exemplo\.com\/.*/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 3600
            }
          }
        }
      ]
    }
  }
})
```

---

## Bundle Optimization

### Analisar Bundle

```bash
# Visualizar tamanho do bundle
npx nuxi analyze
```

### Remover Dependências Não Usadas

```bash
# Encontrar dependências não utilizadas
npx depcheck
```

### Tree Shaking

```typescript
// ✅ Importações específicas (tree-shakeable)
import { ref, computed } from 'vue'
import { Button } from '~/components/ui/button'

// ❌ Importações completas
import * as Vue from 'vue'
import * as UI from '~/components/ui'
```

### Otimizar Dependências

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      include: [
        // Pré-bundle dependências pesadas
        'lodash-es',
        'date-fns'
      ]
    },

    build: {
      // Limite de tamanho para inline de assets
      assetsInlineLimit: 4096,

      // Minificação
      minify: 'esbuild'
    }
  }
})
```

### Compression

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    compressPublicAssets: true,

    // Gzip e Brotli
    prerender: {
      compression: 'gzip'
    }
  }
})
```

---

## Runtime Performance

### Evitar Re-renders Desnecessários

```vue
<script setup>
// ❌ RUIM - Cria nova função a cada render
<button @click="() => handleClick(item.id)">

// ✅ BOM - Função estável
const handleItemClick = (id: string) => handleClick(id)
<button @click="handleItemClick(item.id)">
</script>
```

### Usar shallowRef para Objetos Grandes

```typescript
// ❌ ref() - Reatividade profunda (lento para objetos grandes)
const bigList = ref<Item[]>([])

// ✅ shallowRef() - Reatividade apenas no nível superior
const bigList = shallowRef<Item[]>([])

// Para atualizar, substituir todo o array
bigList.value = [...bigList.value, newItem]
```

### Virtualização de Listas

```bash
npm install @tanstack/vue-virtual
```

```vue
<script setup>
import { useVirtualizer } from '@tanstack/vue-virtual'

const items = ref(Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` })))
const parentRef = ref<HTMLElement | null>(null)

const virtualizer = useVirtualizer({
  count: items.value.length,
  getScrollElement: () => parentRef.value,
  estimateSize: () => 50
})
</script>

<template>
  <div ref="parentRef" style="height: 400px; overflow: auto;">
    <div :style="{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }">
      <div
        v-for="virtualRow in virtualizer.getVirtualItems()"
        :key="virtualRow.index"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`
        }"
      >
        {{ items[virtualRow.index].name }}
      </div>
    </div>
  </div>
</template>
```

### Debounce em Inputs

```typescript
const search = ref('')
const debouncedSearch = refDebounced(search, 300)

// Ou com VueUse
import { useDebounceFn } from '@vueuse/core'

const handleSearch = useDebounceFn((term: string) => {
  fetchResults(term)
}, 300)
```

### Computed vs Watch

```typescript
// ✅ Computed - Cacheia resultado
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ❌ Watch com side effect desnecessário
watch([firstName, lastName], () => {
  fullNameRef.value = `${firstName.value} ${lastName.value}`
})
```

---

## Métricas Core Web Vitals

### Medir no Código

```typescript
// app/plugins/web-vitals.client.ts
import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals'

export default defineNuxtPlugin(() => {
  // Largest Contentful Paint
  onLCP((metric) => {
    console.log('LCP:', metric.value)
    // Enviar para analytics
  })

  // First Input Delay
  onFID((metric) => {
    console.log('FID:', metric.value)
  })

  // Cumulative Layout Shift
  onCLS((metric) => {
    console.log('CLS:', metric.value)
  })

  // Time to First Byte
  onTTFB((metric) => {
    console.log('TTFB:', metric.value)
  })
})
```

### Otimizar LCP

```vue
<!-- Priorizar imagem hero -->
<NuxtImg
  src="/hero.jpg"
  alt="Hero"
  fetchpriority="high"
  loading="eager"
  :preload="true"
/>
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        // Preload de fonte crítica
        {
          rel: 'preload',
          href: '/fonts/inter.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        },
        // Preconnect para APIs externas
        {
          rel: 'preconnect',
          href: 'https://api.exemplo.com'
        }
      ]
    }
  }
})
```

### Otimizar CLS

```css
/* Reservar espaço para imagens */
img {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

/* Reservar espaço para ads/embeds */
.ad-container {
  min-height: 250px;
}

/* Evitar font-swap flash */
@font-face {
  font-family: 'Inter';
  font-display: optional; /* ou 'swap' */
}
```

---

## Checklist de Performance

### Build Time

- [ ] Bundle analisado com `nuxi analyze`
- [ ] Dependências não utilizadas removidas
- [ ] Tree shaking funcionando
- [ ] Compression habilitada (gzip/brotli)

### Images

- [ ] @nuxt/image configurado
- [ ] Formatos modernos (WebP, AVIF)
- [ ] Lazy loading habilitado
- [ ] Tamanhos responsivos configurados
- [ ] Imagem hero com `fetchpriority="high"`

### Data Fetching

- [ ] useLazyFetch para dados não críticos
- [ ] Cache configurado para APIs
- [ ] Prefetch de dados críticos

### Components

- [ ] Componentes pesados com lazy load
- [ ] Listas grandes virtualizadas
- [ ] Modais/drawers carregados sob demanda

### Runtime

- [ ] Debounce em inputs de busca
- [ ] shallowRef para objetos grandes
- [ ] Computed em vez de watch quando possível

### Rendering

- [ ] SSG para páginas estáticas
- [ ] ISR para conteúdo semi-estático
- [ ] SPA para áreas autenticadas

### Core Web Vitals

- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTFB < 800ms

---

## Referências

- [Nuxt Performance](https://nuxt.com/docs/getting-started/performance)
- [Web Vitals](https://web.dev/vitals/)
- [Nuxt Image](https://image.nuxt.com/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
