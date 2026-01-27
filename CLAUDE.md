# CLAUDE.md

Instruções para Claude Code neste repositório.

## Idioma

Sempre responda em Português Brasileiro (pt-BR).

## Git

- Não incluir `Co-Authored-By` nos commits
- Mensagens de commit em português ou inglês (consistente com o projeto)

## Comandos

```bash
# Desenvolvimento
npm run dev          # Servidor dev http://localhost:3000
npm run build        # Build produção
npm run preview      # Preview build

# Qualidade de código
npm run lint         # Verificar ESLint
npm run lint:fix     # Corrigir ESLint
npm run format       # Formatar com Prettier
npm run typecheck    # Verificar tipos
npm run quality      # Todas as verificações
npm run quality:fix  # Corrigir lint + formatar

# Testes
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (uma execução)
npm run test:coverage # Com cobertura
npm run test:e2e     # Playwright E2E
npm run test:e2e:ui  # Playwright UI mode
```

## Componentes shadcn-vue

```bash
npx shadcn-vue@latest add <componente>
```

Componentes ficam em `layers/1-base/app/components/ui/` (auto-import).

## Arquitetura

Nuxt 4 + shadcn-vue + Tailwind CSS v4 + **Nuxt Layers**.

### Estrutura do Projeto

```
projeto/
├── app/                            # APENAS arquivos globais
│   ├── app.vue                     # Root component
│   ├── error.vue                   # Página de erro global
│   ├── assets/css/                 # CSS global
│   └── layouts/default.vue         # Layout padrão
│
├── layers/                         # TODAS as features modulares
│   ├── 1-base/                     # Shared Layer (fundação)
│   │   ├── app/components/ui/      # shadcn-vue
│   │   ├── app/components/common/  # Componentes compartilhados
│   │   ├── app/utils/              # Funções utilitárias
│   │   └── shared/types/           # Tipos globais (via alias #shared)
│   ├── 2-example/                  # Feature: Módulo de exemplo
│   │   ├── app/composables/        # types, api, store, validators
│   │   └── app/pages/example/      # Páginas do módulo
│   └── 4-landing/                  # Feature: Landing page
│       └── app/pages/              # Página home
│
├── server/                         # API global (ou mover para layers)
├── tests/                          # Testes
│   ├── setup.ts                    # Setup global (mocks)
│   ├── unit/                       # Testes unitários (Vitest)
│   ├── integration/                # Testes de integração
│   └── e2e/                        # Testes E2E (Playwright)
│
└── nuxt.config.ts
```

> **Importante:** Use hífen (`-`) e não ponto (`.`) no nome das layers. O ponto causa problemas na resolução de módulos do Nuxt.

### Estrutura da Shared Layer (1-base)

```
layers/1-base/
├── nuxt.config.ts                  # Alias #shared
├── app/
│   ├── components/
│   │   ├── ui/                     # shadcn-vue
│   │   └── common/                 # Componentes compartilhados
│   ├── composables/                # Composables globais
│   └── utils/                      # Funções utilitárias
└── shared/
    └── types/                      # Tipos (via alias #shared)
        ├── index.ts
        └── api.ts
```

### Estrutura de uma Feature Layer

```
layers/2-example/
├── nuxt.config.ts                  # Config (pode ser vazio)
├── app/
│   ├── components/                 # Componentes (prefixar com nome da layer)
│   │   └── ExampleCard.vue
│   ├── composables/
│   │   ├── types.ts                # Tipos do módulo
│   │   ├── useExampleApi.ts        # Service
│   │   ├── useExampleStore.ts      # Pinia store
│   │   └── useExampleValidators.ts # Validadores
│   └── pages/
│       └── example/
│           └── index.vue           # Rota: /example
└── server/                         # API routes (na raiz, NÃO em app/)
    └── api/
```

### Documentação por Diretório

| Diretório | Conteúdo |
|-----------|----------|
| `server/` | API routes, Nitro, validação Zod |
| `layers/1-base/app/components/` | shadcn-vue, componentes compartilhados |
| `layers/1-base/app/composables/` | Composables reutilizáveis |
| `layers/1-base/shared/types/` | Tipos globais (ApiResponse, etc.) |
| `tests/` | Testes unitários, integração e E2E |

### Arquivos Especiais do Nuxt

| Arquivo | Função |
|---------|--------|
| `app/app.vue` | Root component da aplicação |
| `app/error.vue` | Página de erro global (404, 500) |
| `app/layouts/default.vue` | Layout padrão (fallback) |

### Fluxo de Dados

```
UI → Composable/Store → Service → API
```

### Ordem de Prioridade (Layers)

```
app/ > 4-landing > 2-example > 1-base
```

- **1-base**: Menor prioridade - tipos e componentes compartilhados
- **2-example**: Feature layer de exemplo
- **4-landing**: Landing page
- **app/**: Maior prioridade - sempre sobrescreve layers

## Padrões

### Domain (types.ts)

```typescript
export interface Example {
  id: string
  name: string
}
```

### Domain (validators.ts)

```typescript
export function validateExample(name: string): ValidationResult {
  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Nome obrigatório'
  return { isValid: !Object.keys(errors).length, errors }
}
```

### Service

```typescript
export function useExampleApi() {
  async function getAll() {
    return $fetch('/api/examples')
  }
  return { getAll }
}
```

### Store (Composition API)

```typescript
export const useExampleStore = defineStore('example', () => {
  const items = ref<Example[]>([])
  const isLoading = ref(false)

  // API instanciada no setup (preserva contexto Nuxt)
  const api = useExampleApi()

  async function fetchAll() {
    isLoading.value = true
    try {
      items.value = await api.getAll()
    } finally {
      isLoading.value = false
    }
  }

  return { items, isLoading, fetchAll }
})
```

> **Importante:** Use Composition API em stores para garantir que o contexto Nuxt seja preservado corretamente.

## Config

- Tailwind CSS v4 via `@tailwindcss/vite`
- Ícones: lucide-vue-next
- UI primitivos: reka-ui
- Runtime: `apiBaseUrl` (public), `jwtSecret` (server)

---

## Data Fetching (SSR)

### Quando usar cada método

| Método | Quando usar | SSR |
|--------|-------------|-----|
| `useFetch` | Páginas e componentes (carregamento inicial) | ✅ Sim |
| `useAsyncData` | Lógica customizada de fetch | ✅ Sim |
| `$fetch` | Eventos do usuário (cliques, submits) | ❌ Não |

> **Importante:** `useFetch` e `useAsyncData` evitam dupla requisição (servidor + cliente na hidratação). Use `$fetch` apenas para ações do usuário.

### useFetch (Recomendado para SSR)

```typescript
// Em páginas ou componentes - carrega dados no servidor
const { data, status, error, refresh } = await useFetch('/api/users')

// Com tipagem
const { data } = await useFetch<User[]>('/api/users')

// Com parâmetros reativos
const page = ref(1)
const { data } = await useFetch('/api/users', {
  query: { page }
})
```

### useAsyncData (Lógica customizada)

```typescript
// Quando precisar de lógica além de fetch simples
const { data } = await useAsyncData('users', async () => {
  const users = await $fetch('/api/users')
  return users.filter(u => u.active)
})
```

### $fetch (Ações do usuário)

```typescript
// Para eventos - NÃO usar em setup() para dados iniciais
async function handleSubmit() {
  await $fetch('/api/users', {
    method: 'POST',
    body: { name: 'João' }
  })
}
```

### Lazy Loading (Não bloqueia navegação)

```typescript
// Carrega em background, não bloqueia a página
const { data, status } = await useLazyFetch('/api/users')

// Verificar status
if (status.value === 'pending') {
  // Mostra loading
}
```

---

## Middleware de Autenticação

### Tipos de Middleware

| Tipo | Arquivo | Execução |
|------|---------|----------|
| Named | `app/middleware/auth.ts` | Páginas específicas |
| Global | `app/middleware/auth.global.ts` | Todas as rotas |

### Middleware Named (auth.ts)

```typescript
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession()

  // Redireciona se não autenticado
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
```

### Usar em página

```typescript
// Em qualquer página que precisa de auth
definePageMeta({
  middleware: 'auth'
})
```

### Middleware Global

```typescript
// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession()
  const publicRoutes = ['/login', '/register', '/']

  if (!loggedIn.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
})
```

### Retornos do Middleware

```typescript
// Permitir navegação
return // ou não retornar nada

// Redirecionar
return navigateTo('/login')

// Redirecionar com código 301
return navigateTo('/new-path', { redirectCode: 301 })

// Bloquear navegação
return abortNavigation()

// Bloquear com erro
return abortNavigation(createError({ statusCode: 403 }))
```

---

## API Customizada (useAPI)

### Criar wrapper com interceptors

```typescript
// layers/1-base/app/composables/useApi.ts
import type { UseFetchOptions } from 'nuxt/app'

export function useApi<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>
) {
  const config = useRuntimeConfig()

  return useFetch<T>(url, {
    baseURL: config.public.apiBaseUrl,

    // Interceptor de request
    onRequest({ options }) {
      const token = useCookie('auth_token')
      if (token.value) {
        options.headers.set('Authorization', `Bearer ${token.value}`)
      }
    },

    // Interceptor de erro
    onResponseError({ response }) {
      if (response.status === 401) {
        navigateTo('/login')
      }
    },

    ...options
  })
}
```

### Usar no componente

```typescript
// SSR-friendly - dados carregam no servidor
const { data: users, status, error } = await useApi<User[]>('/users')

// Com opções
const { data } = await useApi<User>('/users/1', {
  pick: ['id', 'name'] // Seleciona apenas campos específicos
})
```

### Service com useApi (DDD Lite)

```typescript
// layers/2-users/app/composables/useUserApi.ts
export function useUserApi() {
  async function getAll() {
    return useApi<User[]>('/users')
  }

  async function getById(id: string) {
    return useApi<User>(`/users/${id}`)
  }

  // Para ações do usuário, usar $fetch
  async function create(data: CreateUserData) {
    return $fetch('/users', {
      method: 'POST',
      body: data
    })
  }

  return { getAll, getById, create }
}
```

---

---

## Código Reutilizável (DRY)

### Onde colocar código reutilizável

| Tipo de código | Onde colocar | Exemplo |
|----------------|--------------|---------|
| Funções puras (sem estado) | `layers/1-base/app/utils/` | `formatDate()`, `slugify()` |
| Lógica com estado reativo | `layers/1-base/app/composables/` | `useLoading()`, `usePagination()` |
| Lógica específica da feature | `layers/*/app/composables/` | `useUserForm()` |
| Estado global | Pinia stores | `useAuthStore()` |
| Tipos reutilizáveis | `layers/1-base/shared/types/` | `ApiResponse<T>` |

### Sinais de código duplicado

Extraia para um composable quando ver:

```typescript
// 1. Mesmo padrão de loading/error repetido
const isLoading = ref(false)
const error = ref<string | null>(null)
// → Extrair para useLoading()

// 2. Mesma lógica de debounce
watch(search, debounce(() => fetch(), 300))
// → Extrair para useDebounce()

// 3. Mesmo padrão de paginação
const page = ref(1)
const perPage = ref(10)
// → Extrair para usePagination()

// 4. Mesma validação de campo
if (!value) error = 'Campo obrigatório'
// → Extrair para useField()
```

### Utils vs Composables

```typescript
// UTIL (layers/1-base/app/utils/) - Função pura, sem Vue
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// COMPOSABLE (layers/1-base/app/composables/) - Com estado reativo
export function useCurrency() {
  const locale = ref('pt-BR')
  const currency = ref('BRL')

  const format = (value: number) => {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: currency.value
    }).format(value)
  }

  return { locale, currency, format }
}
```

### Composables Globais Recomendados

| Composable | Uso |
|------------|-----|
| `useLoading()` | Estado de loading com try/catch |
| `useDebounce()` | Debounce reativo para inputs |
| `usePagination()` | Lógica de paginação |
| `useToggle()` | Boolean com toggle |
| `useField()` | Campo de formulário com validação |

> Veja exemplos completos em [layers/1-base/app/composables/CLAUDE.md](layers/1-base/app/composables/CLAUDE.md)

---

## Segurança


### 20 Vulnerabilidades Cobertas

| # | Vulnerabilidade | Prevenção Principal |
|---|-----------------|---------------------|
| 1 | XSS (Reflected, Stored, DOM) | Escapar output, CSP, `v-html` seguro |
| 2 | Clickjacking | `X-Frame-Options: DENY` |
| 3 | CSRF | `nuxt-csurf`, `sameSite: 'strict'` |
| 4 | IDOR | Verificar ownership no servidor |
| 5 | Exposição de Segredos | `runtimeConfig` privado |
| 6 | CSP Fraco | `nuxt-security` com CSP robusto |
| 7 | Falta de SRI | `integrity` em scripts externos |
| 8 | Open Redirect | Whitelist de URLs permitidas |
| 9 | postMessage Inseguro | Validar `event.origin` |
| 10 | Prototype Pollution | Bloquear `__proto__`, usar `Object.create(null)` |
| 11 | DNS Rebinding | Validar header `Host` |
| 12 | Magecart/Formjacking | CSP restrito em checkout, iframes |
| 13 | Supply Chain Attack | `npm audit`, lockfile, Dependabot |
| 14 | Web Storage XSS | Não guardar tokens em localStorage |
| 15 | Service Worker Hijacking | `worker-src: 'self'` |
| 16 | CORS Mal Configurado | Lista explícita de origens |
| 17 | Insecure Deserialization | Zod + JSON.parse com reviver |
| 18 | Path Traversal | Sanitizar paths, bloquear `..` |
| 19 | WebSocket Hijacking | Validar origem e autenticar |
| 20 | Client-Side Validation Trust | **SEMPRE** validar no servidor |

### Módulos Recomendados

```bash
npx nuxi@latest module add security
npx nuxi@latest module add csurf
```

### Configuração Mínima

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-security', 'nuxt-csurf'],

  security: {
    headers: {
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'strict-dynamic'"],
        'frame-ancestors': ["'none'"]
      }
    },
    xssValidator: true,
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 300000
    }
  },

  csurf: {
    https: process.env.NODE_ENV === 'production',
    methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE']
  }
})
```

### Regras de Ouro

```typescript
// 1. Tokens em cookies httpOnly (nunca localStorage)
setCookie(event, 'auth_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
})

// 2. SEMPRE validar no servidor
const result = schema.safeParse(body)
if (!result.success) throw createError({ statusCode: 400 })

// 3. Verificar ownership (IDOR)
if (resource.userId !== event.context.user.id) {
  throw createError({ statusCode: 403 })
}

// 4. Sanitizar paths
if (path.includes('..')) throw createError({ statusCode: 400 })
```

### Checklist Rápido

- [ ] `nuxt-security` + `nuxt-csurf` instalados
- [ ] CSP configurado
- [ ] Tokens em cookies httpOnly
- [ ] Validação server-side com Zod
- [ ] HTTPS em produção
- [ ] Rate limiting em login/API
- [ ] Sourcemaps desabilitados em produção
- [ ] `npm audit` sem vulnerabilidades críticas

---

## Testes

### Estrutura de Testes

```
tests/
├── setup.ts           # Setup global (mocks do Nuxt)
├── unit/              # Testes unitários
├── integration/       # Testes de integração
└── e2e/               # Testes E2E (Playwright)
```

### Teste Unitário (Vitest)

```typescript
// tests/unit/example.test.ts
import { describe, it, expect } from 'vitest'

describe('Example', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### Teste de Composable

```typescript
// tests/unit/composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from '~/composables/useCounter'

describe('useCounter', () => {
  it('should increment', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })
})
```

### Teste E2E (Playwright)

```typescript
// tests/e2e/home.spec.ts
import { test, expect } from '@playwright/test'

test('should display homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Nuxt/)
})
```

### Primeiro Uso do Playwright

```bash
npm run test:e2e:install   # Instala browsers
npm run test:e2e           # Executa testes
```

### Configuração

| Arquivo | Descrição |
|---------|-----------|
| `vitest.config.ts` | Configuração do Vitest |
| `playwright.config.ts` | Configuração do Playwright (multi-browser, mobile) |
| `tests/setup.ts` | Mocks globais do Nuxt |

### Browsers Configurados (Playwright)

- Desktop: Chromium, Firefox, WebKit (Safari)
- Mobile: Chrome (Pixel 5), Safari (iPhone 12)

> **Documentação completa:** [tests/CLAUDE.md](tests/CLAUDE.md)

---

## Documentação Adicional

| Documento | Conteúdo |
|-----------|----------|
| [docs/NUXT_LAYERS.md](docs/NUXT_LAYERS.md) | Guia de Nuxt Layers |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Vercel, Netlify, Docker, AWS |
| [docs/KUBB.md](docs/KUBB.md) | Padrão Kubb + BFF |
| [tests/CLAUDE.md](tests/CLAUDE.md) | Guia completo de testes (Vitest, Playwright) |

---

## Referências

- [Data Fetching - Nuxt 4](https://nuxt.com/docs/4.x/getting-started/data-fetching)
- [useFetch - Nuxt 4](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Middleware - Nuxt 4](https://nuxt.com/docs/4.x/directory-structure/app/middleware)
- [Sessions and Authentication - Nuxt 4](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)
- [Custom useFetch - Nuxt 4](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Composables - Vue.js](https://vuejs.org/guide/reusability/composables.html)
- [VueUse](https://vueuse.org/) - Coleção de composables prontos
