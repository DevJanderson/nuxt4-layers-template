# Template Extraction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extrair o Detecta Alerta em um template Nuxt 4 reutilizavel com base + auth + landing page, sem nenhum residuo de dominio.

**Architecture:** Fork & Strip — copiar o repositorio inteiro, remover layers de feature e arquivos de dominio em etapas, verificando typecheck a cada passo. Auth portado com BFF generico (`callApi`). Identidade parametrizada via `.env` + `app.config.ts` + CSS tokens.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Tailwind CSS v4, shadcn-vue, Pinia, Zod, nuxt-security, Vitest, Playwright.

**Origem:** `/Users/devmac/Documents/Works/detecta-alerta/` (NUNCA modificar)
**Destino:** `/Users/devmac/Documents/Works/template/`

---

## Task 1: Copiar repositorio e inicializar

**Files:**

- Create: `/Users/devmac/Documents/Works/template/` (copia completa)

- [ ] **Step 1: Copiar o repositorio sem .git, node_modules, .nuxt, .output**

```bash
rsync -a --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.nuxt' \
  --exclude='.output' \
  --exclude='.claude' \
  /Users/devmac/Documents/Works/detecta-alerta/ \
  /Users/devmac/Documents/Works/template/
```

- [ ] **Step 2: Inicializar git**

```bash
cd /Users/devmac/Documents/Works/template && git init
```

- [ ] **Step 3: Instalar dependencias**

```bash
cd /Users/devmac/Documents/Works/template && npm install
```

- [ ] **Step 4: Verificar que funciona**

```bash
cd /Users/devmac/Documents/Works/template && npm run typecheck
```

Expected: BUILD sem erros (mesmo resultado do Detecta original).

- [ ] **Step 5: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "chore: copia inicial do detecta alerta para extracao de template"
```

---

## Task 2: Remover layers de feature

**Files:**

- Delete: `layers/meu-municipio/` (inteiro)
- Delete: `layers/lugares-monitorados/` (inteiro)
- Delete: `layers/usuarios/` (inteiro)
- Delete: `layers/rumores/` (inteiro)
- Delete: `layers/relatorios/` (inteiro)
- Delete: `layers/docs/` (inteiro)
- Delete: `content/` (inteiro — Nuxt Content)
- Delete: `generated/` (inteiro — SDK gerado)
- Delete: `openapi-ts.config.ts`
- Modify: `nuxt.config.ts` — remover layers do `extends`

- [ ] **Step 1: Remover diretorios de feature**

```bash
cd /Users/devmac/Documents/Works/template
rm -rf layers/meu-municipio layers/lugares-monitorados layers/usuarios layers/rumores layers/relatorios layers/docs
rm -rf content
rm -rf generated
rm -f openapi-ts.config.ts
```

- [ ] **Step 2: Atualizar nuxt.config.ts — remover layers do extends**

No `nuxt.config.ts`, o array `extends` lista 9 layers. Reduzir para 3:

```ts
extends: [
  './layers/base',
  './layers/auth',
  './layers/home',
],
```

- [ ] **Step 3: Remover alias `#generated` do nuxt.config.ts**

Remover a linha:

```ts
'#generated': resolve(__dirname, './generated'),
```

- [ ] **Step 4: Remover `build.transpile` de echarts do nuxt.config.ts**

Remover ou limpar o array `build.transpile` que contém `/echarts/` e `/vue-echarts/`.

- [ ] **Step 5: Remover modulos que nao se aplicam**

No array `modules` do `nuxt.config.ts`, remover `@nuxt/content` se presente.

- [ ] **Step 6: Remover `content` config do nuxt.config.ts**

Remover o bloco `content: { ... }` inteiro.

- [ ] **Step 7: Limpar `vite.optimizeDeps.include`**

Remover do array: `echarts`, `echarts/core`, `echarts/charts`, `echarts/components`, `echarts/renderers`, `vue-echarts`, `@tanstack/vue-table`, `maska`, e qualquer referencia a libs removidas.

- [ ] **Step 8: Limpar routeRules**

Remover regras de rota para features que nao existem mais (`/api/lugares-monitorados/**`, `/api/rumores/**`, `/api/usuarios/**`, `/api/home/**`, etc.). Manter apenas `/api/auth/**`.

- [ ] **Step 9: Tentar typecheck (vai falhar — esperado)**

```bash
cd /Users/devmac/Documents/Works/template && npm run typecheck
```

Expected: FALHA — ainda ha imports de `#generated`, `#shared/types/sinapse`, etc. nos arquivos que ficaram. Isso sera resolvido nas tasks seguintes.

- [ ] **Step 10: Commit parcial**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "chore: remove layers de feature e configs associadas"
```

---

## Task 3: Remover arquivos de dominio da layer base

**Files:**

- Delete: `layers/base/shared/types/sinapse/` (diretorio inteiro — 7+ arquivos)
- Delete: `layers/base/shared/utils/brazil-constants.ts`
- Delete: `layers/base/shared/utils/epidemiological-helpers.ts`
- Delete: `layers/base/shared/utils/semana-epidemiologica.ts`
- Delete: `layers/base/shared/utils/date-formatters.ts`
- Delete: `layers/base/app/composables/useRegionStats.ts`
- Delete: `layers/base/app/composables/useMapCore.ts`
- Delete: `layers/base/app/composables/useMapLayers.ts`
- Delete: `layers/base/app/composables/useMapMarkers.ts`
- Delete: `layers/base/app/components/common/MapSinapseStatus.vue`
- Delete: `layers/base/app/components/common/MapZoom.vue`
- Delete: `layers/base/app/components/common/MapNavigation.vue`
- Delete: `layers/base/app/components/common/AppTopBar.vue` (usa useRegionStats — acoplado)
- Delete: `layers/base/app/utils/map-colors.ts`
- Delete: `layers/base/app/utils/map-config.ts`
- Delete: `layers/base/app/utils/map-cluster.ts`
- Delete: `layers/base/app/utils/chart-colors.ts`
- Delete: `layers/base/app/utils/button-variants.ts` (nao usado em nenhum .vue/.ts)
- Delete: `layers/base/app/utils/format-variation.ts` (nao referenciado)
- Delete: `layers/base/app/utils/constants.ts` (NAV_LINKS migra para app.config, ESTADOS_BR removido)

- [ ] **Step 1: Remover shared/types/sinapse e utils de dominio**

```bash
cd /Users/devmac/Documents/Works/template
rm -rf layers/base/shared/types/sinapse
rm -f layers/base/shared/utils/brazil-constants.ts
rm -f layers/base/shared/utils/epidemiological-helpers.ts
rm -f layers/base/shared/utils/semana-epidemiologica.ts
rm -f layers/base/shared/utils/date-formatters.ts
```

- [ ] **Step 2: Remover composables de mapa e region**

```bash
cd /Users/devmac/Documents/Works/template
rm -f layers/base/app/composables/useRegionStats.ts
rm -f layers/base/app/composables/useMapCore.ts
rm -f layers/base/app/composables/useMapLayers.ts
rm -f layers/base/app/composables/useMapMarkers.ts
```

- [ ] **Step 3: Remover componentes de mapa e TopBar**

```bash
cd /Users/devmac/Documents/Works/template
rm -f layers/base/app/components/common/MapSinapseStatus.vue
rm -f layers/base/app/components/common/MapZoom.vue
rm -f layers/base/app/components/common/MapNavigation.vue
rm -f layers/base/app/components/common/AppTopBar.vue
```

- [ ] **Step 4: Remover utils mortos**

```bash
cd /Users/devmac/Documents/Works/template
rm -f layers/base/app/utils/map-colors.ts
rm -f layers/base/app/utils/map-config.ts
rm -f layers/base/app/utils/map-cluster.ts
rm -f layers/base/app/utils/chart-colors.ts
rm -f layers/base/app/utils/button-variants.ts
rm -f layers/base/app/utils/format-variation.ts
rm -f layers/base/app/utils/constants.ts
```

- [ ] **Step 5: Criar shared/types/ vazio com .gitkeep**

```bash
mkdir -p /Users/devmac/Documents/Works/template/layers/base/shared/types
touch /Users/devmac/Documents/Works/template/layers/base/shared/types/.gitkeep
```

- [ ] **Step 6: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "chore: remove arquivos de dominio epidemiologico e mapa da base"
```

---

## Task 4: Renomear Sinapse para API generica

**Files:**

- Rename: `layers/base/server/utils/sinapse-client.ts` → `api-client.ts`
- Rename: `layers/base/server/utils/sinapse-sdk.ts` → `api-sdk.ts`
- Modify: `api-client.ts` — renomear funcao e config key
- Modify: `api-sdk.ts` — renomear funcoes e remover import `#generated`

- [ ] **Step 1: Renomear arquivos**

```bash
cd /Users/devmac/Documents/Works/template
mv layers/base/server/utils/sinapse-client.ts layers/base/server/utils/api-client.ts
mv layers/base/server/utils/sinapse-sdk.ts layers/base/server/utils/api-sdk.ts
```

- [ ] **Step 2: Reescrever api-client.ts**

```ts
const DEFAULT_TIMEOUT = 15_000

export function createApiClient(accessToken?: string) {
  const config = useRuntimeConfig()
  const baseUrl = config.apiBaseUrl as string

  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      message: 'NUXT_API_BASE_URL não configurada'
    })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  return { baseUrl, headers, timeout: DEFAULT_TIMEOUT }
}
```

- [ ] **Step 3: Reescrever api-sdk.ts**

```ts
import type { H3Event } from 'h3'

interface ApiClientConfig {
  baseUrl: string
  headers: Record<string, string>
  timeout: number
}

export async function callApi<T>(
  apiFn: (config: ApiClientConfig) => Promise<T>,
  event: H3Event,
  errorContext: string
): Promise<T> {
  const accessToken = requireAuth(event)
  const config = createApiClient(accessToken)

  try {
    return await apiFn(config)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    logger.error(errorContext, error)
    throw createError({ statusCode: 500, message: errorContext })
  }
}

export async function callPublicApi<T>(
  apiFn: (config: ApiClientConfig) => Promise<T>,
  errorContext: string
): Promise<T> {
  const config = createApiClient()

  try {
    return await apiFn(config)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    logger.error(errorContext, error)
    throw createError({ statusCode: 500, message: errorContext })
  }
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "refactor: renomeia sinapse para api generica no BFF"
```

---

## Task 5: Refatorar shared/domain/errors.ts

**Files:**

- Modify: `layers/base/shared/domain/errors.ts`

- [ ] **Step 1: Reescrever errors.ts — so AuthErrors + ValidationErrors**

```ts
// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const AuthErrors = {
  INVALID_CREDENTIALS: 'credenciais inválidas',
  SESSION_EXPIRED: 'sessão expirada, faça login novamente',
  REFRESH_FAILED: 'falha ao renovar sessão',
  LOGIN_FAILED: 'falha ao realizar login',
  SIGNUP_FAILED: 'falha ao realizar cadastro',
  LOGOUT_FAILED: 'falha ao realizar logout',
  FETCH_USER_FAILED: 'falha ao buscar dados do usuário',
  CONFIG_MISSING: 'URL da API não configurada',
  UNAUTHORIZED: 'acesso não autorizado'
} as const

export type AuthErrorCode = (typeof AuthErrors)[keyof typeof AuthErrors]

export const AuthMessages = {
  LOGIN_SUCCESS: 'login realizado com sucesso',
  LOGOUT_SUCCESS: 'logout realizado com sucesso',
  SIGNUP_SUCCESS: 'cadastro realizado com sucesso',
  RESET_PASSWORD_SUCCESS: 'email de recuperação enviado com sucesso'
} as const

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
export const ValidationErrors = {
  INVALID_BODY: 'dados inválidos no corpo da requisição',
  INVALID_QUERY: 'parâmetros de consulta inválidos',
  INVALID_PARAM: (name: string) => `parâmetro de rota inválido: ${name}`
} as const
```

- [ ] **Step 2: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "refactor: reduz errors.ts a auth e validation apenas"
```

---

## Task 6: Refatorar auth-constants.ts

**Files:**

- Modify: `layers/base/shared/utils/auth-constants.ts`

- [ ] **Step 1: Genericizar ADMIN_GROUP**

```ts
export const TOKEN_REFRESH_MARGIN_SECONDS = 5 * 60
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7
export const ADMIN_GROUP = 'admin' as const
```

- [ ] **Step 2: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "refactor: genericiza admin group name"
```

---

## Task 7: Refatorar nuxt.config.ts — runtimeConfig e identidade

**Files:**

- Modify: `nuxt.config.ts`

- [ ] **Step 1: Atualizar runtimeConfig**

Substituir:

```ts
runtimeConfig: {
  sinapseApiUrl: '',
  public: {
    apiBaseUrl: '',
    siteUrl: 'https://alerta.sinapse.org.br',
  },
},
```

Por:

```ts
runtimeConfig: {
  apiBaseUrl: '',
  public: {
    apiBaseUrl: '',
    siteUrl: '',
    siteName: '',
    siteDescription: '',
  },
},
```

- [ ] **Step 2: Atualizar app.head**

Substituir titulo e theme-color hardcoded por valores genericos:

```ts
app: {
  head: {
    htmlAttrs: { lang: 'pt-BR' },
    link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  },
},
```

Remover `title` e `meta` de theme-color do head (SEO cuida via `useSeoPage`).

- [ ] **Step 3: Atualizar site config**

```ts
site: {
  url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  name: process.env.NUXT_PUBLIC_SITE_NAME || 'Meu Projeto',
},
```

- [ ] **Step 4: Atualizar schemaOrg**

```ts
schemaOrg: {
  identity: {
    type: 'Organization',
    name: process.env.NUXT_PUBLIC_SITE_NAME || 'Meu Projeto',
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
},
```

- [ ] **Step 5: Atualizar robots**

Remover rotas especificas, manter generico:

```ts
robots: {
  disallow: ['/api/', '/auth/'],
},
```

- [ ] **Step 6: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "refactor: parametriza identidade do projeto no nuxt.config"
```

---

## Task 8: Criar app.config.ts e .env.example

**Files:**

- Create: `app.config.ts`
- Create: `.env.example`
- Create: `.env`

- [ ] **Step 1: Criar app.config.ts**

```ts
export default defineAppConfig({
  brand: {
    logo: {
      default: '/brand/logo-default.svg',
      light: '/brand/logo-light.svg'
    }
  },
  nav: [{ label: 'início', to: '/', icon: 'lucide:house' }],
  footer: {
    copyright: '© {year} Sua Empresa',
    address: '',
    social: [] as Array<{ icon: string; href: string; label: string }>,
    links: [] as Array<{ label: string; to: string; disabled?: boolean }>
  }
})
```

- [ ] **Step 2: Criar .env.example**

```env
# API Backend
NUXT_API_BASE_URL=http://localhost:8000
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Site
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_NAME=Meu Projeto
NUXT_PUBLIC_SITE_DESCRIPTION=Descricao do projeto
```

- [ ] **Step 3: Criar .env com mesmos valores**

```env
NUXT_API_BASE_URL=http://localhost:8000
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_NAME=Meu Projeto
NUXT_PUBLIC_SITE_DESCRIPTION=Descricao do projeto
```

- [ ] **Step 4: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add app.config.ts .env.example
git commit -m "feat: cria app.config.ts e .env.example para identidade do projeto"
```

---

## Task 9: Refatorar useSeoPage.ts

**Files:**

- Modify: `layers/base/app/composables/useSeoPage.ts`

- [ ] **Step 1: Reescrever useSeoPage para ler de runtimeConfig**

```ts
import type { SeoPageOptions } from '../types'

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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "refactor: useSeoPage le identidade de runtimeConfig"
```

---

## Task 10: Refatorar AppHeader.vue

**Files:**

- Modify: `layers/base/app/components/common/AppHeader.vue`

- [ ] **Step 1: Reescrever AppHeader para usar appConfig**

O AppHeader deve:

- Ler logos de `useAppConfig().brand.logo`
- Ler nav de `useAppConfig().nav`
- Remover imports de `NAV_LINKS` e `constants`
- Manter logica de active link, auth menu, mobile sheet
- Remover logo ITpS (so uma logo do projeto)
- Remover referencia a `AppTopBar` se existir

Substituir todas as ocorrencias de:

```vue
<NuxtImg src="/brand/itps-horizontal-default.svg" ... />
<NuxtImg src="/brand/detecta-default.svg" ... />
```

Por:

```vue
<NuxtImg :src="appConfig.brand.logo.default" alt="Logo" ... />
```

E trocar `NAV_LINKS` por `appConfig.nav`:

```vue
<script setup lang="ts">
const appConfig = useAppConfig()
const authStore = useAuthStore()
const route = useRoute()

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>
```

- [ ] **Step 2: Verificar que nao ha referencia residual a constants/NAV_LINKS**

```bash
cd /Users/devmac/Documents/Works/template
grep -r "NAV_LINKS\|constants" layers/base/app/components/common/AppHeader.vue
```

Expected: zero resultados.

- [ ] **Step 3: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "refactor: appheader le nav e logos de appConfig"
```

---

## Task 11: Refatorar AppFooter.vue

**Files:**

- Modify: `layers/base/app/components/common/AppFooter.vue`

- [ ] **Step 1: Reescrever AppFooter para usar appConfig**

O AppFooter deve:

- Ler logo de `useAppConfig().brand.logo.light`
- Ler copyright, address, social, links de `useAppConfig().footer`
- Remover todos os dados hardcoded (ITpS, endereço, redes sociais)
- Manter estrutura visual (bg-secondary-950, grid, etc.)
- Renderizar `footer.social` como icones com links
- Renderizar `footer.links` como lista
- Substituir `{year}` em copyright pelo ano atual

```vue
<script setup lang="ts">
const appConfig = useAppConfig()
const currentYear = new Date().getFullYear()
const copyright = computed(() => appConfig.footer.copyright.replace('{year}', String(currentYear)))
</script>
```

- [ ] **Step 2: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "refactor: appfooter le dados de appConfig"
```

---

## Task 12: Refatorar error.vue e logger.ts

**Files:**

- Modify: `layers/base/app/error.vue`
- Modify: `layers/base/server/utils/logger.ts`

- [ ] **Step 1: Atualizar error.vue — remover referencia ao Detecta Alerta**

Substituir:

```ts
useSeoPage({
  title: is404.value ? 'Página não encontrada - Detecta Alerta' : 'Erro - Detecta Alerta'
})
```

Por:

```ts
useSeoPage({ title: is404.value ? 'Página não encontrada' : 'Erro' })
```

Tambem remover a descricao epidemiologica do 404:

```ts
const description = computed(() => {
  if (is404.value) return 'A página que você procura não foi encontrada.'
  return props.error.message || 'Algo deu errado. Tente novamente mais tarde.'
})
```

- [ ] **Step 2: Atualizar logger.ts — tag generica**

Substituir:

```ts
defaults: {
  tag: 'detecta'
}
```

Por:

```ts
defaults: {
  tag: 'app'
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "refactor: remove referencias ao detecta alerta de error.vue e logger"
```

---

## Task 13: Refatorar layer auth — desacoplar do Sinapse

**Files:**

- Create: `layers/auth/app/types/schemas.ts`
- Modify: `layers/auth/app/types/index.ts`
- Modify: `layers/auth/server/utils/login-usecase.ts`
- Modify: `layers/auth/server/utils/auth.ts` (se referencia sinapse)
- Modify: `layers/auth/server/api/auth/login.post.ts`
- Modify: `layers/auth/server/api/auth/me.get.ts`
- Modify: `layers/auth/server/api/auth/logout.post.ts`
- Modify: `layers/auth/server/api/auth/reset-password.post.ts`
- Modify: `layers/auth/server/api/auth/signup.post.ts` (se existe — verificar se faz sentido no template)
- Modify: `layers/auth/server/middleware/02.admin.ts`

- [ ] **Step 1: Criar schemas.ts com Zod schemas do auth**

```ts
// layers/auth/app/types/schemas.ts
import { z } from 'zod'

export const loginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export const tokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  token_type: z.optional(z.string().default('bearer'))
})

export const resetPasswordRequestSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido').max(255)
})

export type LoginRequest = z.infer<typeof loginRequestSchema>
export type Token = z.infer<typeof tokenSchema>
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>
```

- [ ] **Step 2: Atualizar auth/app/types/index.ts — remover import sinapse**

```ts
export type { LoginRequest as LoginCredentials } from './schemas'

export interface AuthPermissao {
  id: number
  codigo: string
  nome: string
  descricao?: string | null
}

export interface AuthGrupo {
  id: number
  nome: string
  descricao?: string | null
}

export interface AuthUser {
  id: number
  nome: string
  email: string
  ativo: boolean
  telefone?: string | null
  estado?: string | null
  cidade?: string | null
  funcao?: string | null
  instituicao?: string | null
  ultimo_login?: string | null
  permissoes: AuthPermissao[]
  grupos: AuthGrupo[]
}

export interface LoginResponse {
  user: AuthUser
}

export interface ResetPasswordData {
  email: string
}

export interface ResetPasswordResponse {
  message: string
}
```

- [ ] **Step 3: Reescrever login-usecase.ts — usar callPublicApi + $fetch**

O login-usecase original importa funcoes do SDK gerado (`loginApiV1AuthLoginPost`, `getMeApiV1UsuariosMeGet`). No template, usamos `$fetch` direto com `createApiClient`:

```ts
import { tokenSchema } from '../../app/types/schemas'
import type { AuthUser } from '../../app/types'

interface LoginOutput {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export async function executeLogin(
  username: string,
  password: string
): Promise<Result<LoginOutput>> {
  const client = createApiClient()

  // Step 1: Login — obter tokens
  let tokenData
  try {
    const response = await $fetch<Record<string, unknown>>(`${client.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: client.headers,
      body: { username, password },
      timeout: client.timeout
    })
    const parsed = tokenSchema.safeParse(response)
    if (!parsed.success) return fail(AuthErrors.LOGIN_FAILED)
    tokenData = parsed.data
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const status = (error as { statusCode: number }).statusCode
      if (status === 401 || status === 422) return fail(AuthErrors.INVALID_CREDENTIALS)
    }
    return fail(AuthErrors.LOGIN_FAILED)
  }

  // Step 2: Buscar dados do usuario com token
  let user: AuthUser
  try {
    const authClient = createApiClient(tokenData.access_token)
    user = await $fetch<AuthUser>(`${authClient.baseUrl}/api/v1/usuarios/me`, {
      headers: authClient.headers,
      timeout: authClient.timeout
    })
  } catch {
    return fail(AuthErrors.FETCH_USER_FAILED)
  }

  return ok({
    user,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token
  })
}
```

Nota: As URLs `/api/v1/auth/login` e `/api/v1/usuarios/me` sao especificas do backend. O dev que conectar outro backend ajusta aqui.

- [ ] **Step 4: Atualizar auth.ts (server/utils) — remover imports sinapse**

Verificar e substituir imports de `#shared/types/sinapse/auth` por imports de `../../app/types/schemas`. Substituir `config.sinapseApiUrl` por `config.apiBaseUrl`.

- [ ] **Step 5: Atualizar endpoints BFF do auth**

Para cada endpoint em `layers/auth/server/api/auth/`:

- `login.post.ts` — substituir import de `#shared/types/sinapse/auth` por `../../types/schemas`
- `me.get.ts` — substituir `createSinapseClient` por `createApiClient`, `#generated/sinapse/sdk.gen` por `$fetch` direto
- `logout.post.ts` — substituir `createSinapseClient` por `createApiClient`, `#generated/sinapse/sdk.gen` por `$fetch` direto
- `reset-password.post.ts` — idem
- `signup.post.ts` — se existir, idem. Se nao fizer sentido no template, remover.

Para cada endpoint, o padrao e:

```ts
// Antes (Detecta):
const client = createSinapseClient(accessToken)
const result = await sdkFunction({ client })

// Depois (template):
const client = createApiClient(accessToken)
const data = await $fetch(`${client.baseUrl}/api/v1/...`, {
  method: 'POST',
  headers: client.headers,
  body: validatedBody,
  timeout: client.timeout
})
```

- [ ] **Step 6: Atualizar 02.admin.ts middleware**

Substituir `createSinapseClient` por `createApiClient` e `#generated/sinapse/sdk.gen` por `$fetch`.

- [ ] **Step 7: Verificar typecheck**

```bash
cd /Users/devmac/Documents/Works/template && npm run typecheck
```

Resolver erros ate passar.

- [ ] **Step 8: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "refactor: desacopla auth da api sinapse"
```

---

## Task 14: Simplificar layer home

**Files:**

- Delete: `layers/home/app/components/` (todos os 18 componentes)
- Delete: `layers/home/app/composables/` (se existir)
- Delete: `layers/home/app/types/` (se existir)
- Delete: `layers/home/app/utils/` (se existir)
- Delete: `layers/home/server/` (se existir)
- Delete: `layers/home/app/pages/termos.vue`
- Create: `layers/home/app/components/HomeHero.vue`
- Modify: `layers/home/app/pages/index.vue`
- Modify: `layers/home/nuxt.config.ts`

- [ ] **Step 1: Limpar home**

```bash
cd /Users/devmac/Documents/Works/template
rm -rf layers/home/app/components
rm -rf layers/home/app/composables
rm -rf layers/home/app/types
rm -rf layers/home/app/utils
rm -rf layers/home/server
rm -f layers/home/app/pages/termos.vue
```

- [ ] **Step 2: Simplificar nuxt.config.ts da home**

```ts
export default defineNuxtConfig({})
```

- [ ] **Step 3: Criar HomeHero.vue**

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
const siteName = config.public.siteName as string
const siteDescription = config.public.siteDescription as string
</script>

<template>
  <section class="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
    <h1 class="text-4xl font-bold tracking-tight text-base-950 sm:text-5xl lg:text-6xl">
      {{ siteName }}
    </h1>
    <p class="mt-6 max-w-2xl text-lg text-base-600">
      {{ siteDescription }}
    </p>
    <div class="mt-10">
      <NuxtLink
        to="/auth/login"
        class="rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
      >
        Entrar
      </NuxtLink>
    </div>
  </section>
</template>
```

- [ ] **Step 4: Reescrever index.vue**

```vue
<script setup lang="ts">
useSeoPage({ title: 'Início' })
</script>

<template>
  <div>
    <HomeHero />
  </div>
</template>
```

- [ ] **Step 5: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "refactor: simplifica home para landing page generica"
```

---

## Task 15: Limpar package.json

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Remover dependencias de features**

Remover do `dependencies`:

- `leaflet`, `@types/leaflet`, `leaflet.markercluster`
- `echarts`, `vue-echarts`
- `@tanstack/vue-table`
- `@nuxt/content`
- `better-sqlite3`
- `maska`
- `mermaid`

Remover do `devDependencies`:

- `@hey-api/openapi-ts`
- `@hey-api/client-fetch`
- Qualquer tipo `@types/` de libs removidas

- [ ] **Step 2: Remover script generate:api**

Remover do `scripts`:

```json
"generate:api": "..."
```

- [ ] **Step 3: Atualizar nome do pacote**

```json
"name": "nuxt-template"
```

- [ ] **Step 4: Reinstalar dependencias**

```bash
cd /Users/devmac/Documents/Works/template && rm -rf node_modules package-lock.json && npm install
```

- [ ] **Step 5: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "chore: limpa dependencias de features removidas"
```

---

## Task 16: Limpar assets e paleta

**Files:**

- Delete: `public/brand/itps-horizontal-default.svg`
- Delete: `public/brand/itps-light.svg`
- Delete: `public/brand/detecta-default.svg`
- Delete: `public/brand/detecta-light.svg`
- Delete: `public/brand/sinapse.webp`
- Delete: `public/mosquito.webp`
- Delete: `public/home-bg.png`
- Create: `public/brand/logo-default.svg` (placeholder)
- Create: `public/brand/logo-light.svg` (placeholder)
- Modify: `layers/base/app/assets/css/main.css`

- [ ] **Step 1: Remover assets de marca**

```bash
cd /Users/devmac/Documents/Works/template
rm -f public/brand/itps-horizontal-default.svg
rm -f public/brand/itps-light.svg
rm -f public/brand/detecta-default.svg
rm -f public/brand/detecta-light.svg
rm -f public/brand/sinapse.webp
rm -f public/mosquito.webp
rm -f public/home-bg.png
```

- [ ] **Step 2: Criar logos placeholder**

Criar `public/brand/logo-default.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" fill="none">
  <rect width="200" height="40" rx="8" fill="#6366f1" opacity="0.1"/>
  <text x="100" y="25" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="600" fill="#6366f1">Seu Logo</text>
</svg>
```

Criar `public/brand/logo-light.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" fill="none">
  <rect width="200" height="40" rx="8" fill="white" opacity="0.1"/>
  <text x="100" y="25" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="600" fill="white">Seu Logo</text>
</svg>
```

- [ ] **Step 3: Atualizar paleta no main.css**

Substituir os valores de paleta da marca por placeholder indigo/sky. Trocar os comentarios `/* TEMA LIGHT — Detecta Alerta (ITPS) */` e `/* TEMA DARK — Detecta Alerta (ITPS) */` por `/* TEMA LIGHT */` e `/* TEMA DARK */`.

Remover o utilitario `bg-login` (referencia `home-bg.png` que foi removido).

Substituir as cores primary (vermelho ITPS) por indigo e secondary (azul ITPS) por sky como placeholders.

- [ ] **Step 4: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "chore: substitui assets de marca por placeholders"
```

---

## Task 17: Simplificar Dockerfile

**Files:**

- Modify: `Dockerfile`

- [ ] **Step 1: Reescrever Dockerfile sem deps de better-sqlite3**

```dockerfile
# Stage 1: Build
FROM node:22-alpine3.21 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine3.21

LABEL org.opencontainers.image.title="Nuxt Template"

WORKDIR /app

COPY --from=builder /app/.output .output

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5173

EXPOSE 5173

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider --quiet http://localhost:5173/ || exit 1

CMD ["node", ".output/server/index.mjs"]
```

- [ ] **Step 2: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "chore: simplifica dockerfile sem deps nativas"
```

---

## Task 18: Limpar e adaptar testes

**Files:**

- Delete: testes de features removidas
- Modify: testes do auth e base que referenciam sinapse

- [ ] **Step 1: Remover testes de features removidas**

```bash
cd /Users/devmac/Documents/Works/template
# Integration
rm -rf tests/integration/home
rm -rf tests/integration/lugares-monitorados
rm -rf tests/integration/meu-municipio
rm -rf tests/integration/relatorios
rm -rf tests/integration/rumores
rm -rf tests/integration/usuarios

# Unit
rm -rf tests/unit/home
rm -rf tests/unit/lugares-monitorados
rm -rf tests/unit/meu-municipio
rm -rf tests/unit/rumores
rm -rf tests/unit/usuarios
rm -rf tests/unit/docs

# Unit/bff — remover endpoints de features
rm -f tests/unit/bff/home-endpoints*
rm -f tests/unit/bff/lugares-*
rm -f tests/unit/bff/meu-municipio-*
rm -f tests/unit/bff/rumores-*
rm -f tests/unit/bff/usuarios-*
rm -f tests/unit/bff/perfil-*

# Unit/base — remover utils de dominio
rm -f tests/unit/base/chart-colors*
rm -f tests/unit/base/date-formatters*
rm -f tests/unit/base/epidemiological-helpers*
rm -f tests/unit/base/format-variation*
rm -f tests/unit/base/map-colors*

# Unit/utils — remover utils de dominio
rm -f tests/unit/utils/home-*
rm -f tests/unit/utils/semana-epidemiologica*

# E2E — remover testes de features
rm -f tests/e2e/home-dashboard.spec.ts
rm -f tests/e2e/homepage.spec.ts
rm -f tests/e2e/rumores.spec.ts
rm -rf tests/e2e/fixtures
```

- [ ] **Step 2: Adaptar testes que referenciam sinapse**

Para cada teste restante em `tests/unit/bff/` e `tests/unit/auth/`:

- Substituir `callSinapse` por `callApi` em `vi.stubGlobal`
- Substituir `callSinapsePublic` por `callPublicApi`
- Substituir `createSinapseClient` por `createApiClient`
- Substituir imports de `#shared/types/sinapse/` por paths corretos
- Substituir `alerta.sinapse.org.br` por `http://localhost:3000` em asserts

- [ ] **Step 3: Adaptar vitest.config.ts**

Remover alias `#generated` do projeto `unit`. Remover excludes de coverage que referenciam arquivos removidos (map utils, chart colors, etc.).

- [ ] **Step 4: Adaptar playwright.config.ts**

Remover fixtures e specs de features removidas. Manter apenas `auth.setup.ts` e `auth.spec.ts`.

- [ ] **Step 5: Verificar testes**

```bash
cd /Users/devmac/Documents/Works/template && npm run test
```

Resolver falhas ate todos passarem.

- [ ] **Step 6: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "test: adapta testes para template sem features de dominio"
```

---

## Task 19: Verificacao typecheck + quality

**Files:** nenhum novo — correcao de erros residuais

- [ ] **Step 1: Rodar typecheck**

```bash
cd /Users/devmac/Documents/Works/template && npm run typecheck
```

- [ ] **Step 2: Corrigir erros de tipo**

Resolver todos os erros de tipo que aparecerem — imports quebrados, tipos faltando, etc.

- [ ] **Step 3: Rodar quality**

```bash
cd /Users/devmac/Documents/Works/template && npm run quality:fix
```

- [ ] **Step 4: Rodar testes**

```bash
cd /Users/devmac/Documents/Works/template && npm run test
```

- [ ] **Step 5: Commit correcoes**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "fix: corrige erros de tipo e qualidade pos-extracao"
```

---

## Task 20: Grep final — buscar residuos de dominio

**Files:** nenhum novo — verificacao

- [ ] **Step 1: Buscar residuos**

```bash
cd /Users/devmac/Documents/Works/template
grep -ri "sinapse\|detecta\|itps\|epidem\|agravo\|municipio\|vigilancia\|saude" \
  --include="*.ts" --include="*.vue" --include="*.css" --include="*.json" \
  --include="*.md" --include="*.mjs" --include="*.sh" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.nuxt --exclude-dir=specs
```

Expected: zero resultados.

- [ ] **Step 2: Se houver residuos, corrigir e repetir**

Cada ocorrencia deve ser removida ou genericizada.

- [ ] **Step 3: Commit se houve correcoes**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "chore: remove residuos de dominio encontrados no grep final"
```

---

## Task 21: Escrever CLAUDE.md do template

**Files:**

- Create: `CLAUDE.md`

- [ ] **Step 1: Escrever CLAUDE.md com 12 secoes**

O CLAUDE.md deve conter:

1. **REGRAS INVIOLAVEIS** — idioma pt-BR, commits sem Co-Authored-By, nunca rodar npm run dev, persona Vue Craftsman Pragmatico
2. **IDENTIDADE** — placeholder com tabela de stack (mesmas tecnologias, sem as removidas)
3. **COMANDOS** — mesmos scripts npm
4. **PRINCIPIOS** — ETC (Easier to Change)
5. **REGRAS DE CODIGO** — ESLint, Vue, imports, Tailwind, formularios
6. **ARQUITETURA** — 3 layers (base, auth, home), aliases, fluxo de dados
7. **ONDE COLOCAR** — arvore de decisao
8. **COMO CONSTRUIR** — service, store, BFF, SSR, componentes, pages, imports, persistencia
9. **COMO CRIAR UMA NOVA FEATURE LAYER** — passo a passo:
   - Criar estrutura de diretorios (`layers/{feature}/nuxt.config.ts`, `app/components/`, `composables/`, `pages/`, `types/`, `server/api/`)
   - Registrar no `extends` do `nuxt.config.ts` raiz
   - Criar `types/index.ts` com interfaces
   - Adicionar erros em `shared/domain/errors.ts`
   - Criar service `use{Feature}Api.ts` com `$fetch`
   - Criar store `use{Feature}Store.ts` com `withStoreAction`
   - Criar endpoints BFF com `callApi` + `validateBody`/`validateQuery`
   - Criar componentes com prefixo `{Feature}*`
   - Criar paginas com `definePageMeta({ middleware: 'auth-guard' })`
   - Adicionar nav em `app.config.ts`
   - Criar testes unit + integration
   - Exemplo completo de endpoint BFF (3 linhas canonicas)
   - Exemplo completo de store action com `withStoreAction`
10. **COMO CONECTAR UM NOVO BACKEND** — trocar `NUXT_API_BASE_URL`, adaptar `createApiClient`, ajustar `login-usecase.ts` e `auth.ts`, ajustar Zod schemas
11. **COMO VALIDAR** — tabela unit vs nuxt
12. **COMO ENTREGAR** — gitflow, commits, quality gates

- [ ] **Step 2: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add CLAUDE.md
git commit -m "docs: claude.md com guia completo para ia"
```

---

## Task 22: Escrever README.md

**Files:**

- Create: `README.md`

- [ ] **Step 1: Escrever README.md**

Secoes:

- **Titulo** — "Nuxt 4 Template"
- **Quick Start** — 3 passos: copiar, editar .env + app.config + main.css, npm install && npm run typecheck
- **Estrutura** — diagrama de layers
- **Stack** — tabela de tecnologias
- **Customizacao** — como trocar paleta, logos, backend, criar primeira feature
- **Scripts** — tabela de comandos npm
- **Testes** — como rodar, estrutura de projetos vitest
- **Deploy** — Dockerfile, variaveis de ambiente

- [ ] **Step 2: Commit**

```bash
cd /Users/devmac/Documents/Works/template
git add README.md
git commit -m "docs: readme com guia de setup e customizacao"
```

---

## Task 23: Verificacao final completa

**Files:** nenhum novo

- [ ] **Step 1: Typecheck**

```bash
cd /Users/devmac/Documents/Works/template && npm run typecheck
```

Expected: zero erros.

- [ ] **Step 2: Quality**

```bash
cd /Users/devmac/Documents/Works/template && npm run quality
```

Expected: zero erros.

- [ ] **Step 3: Testes**

```bash
cd /Users/devmac/Documents/Works/template && npm run test
```

Expected: todos passam.

- [ ] **Step 4: Grep residuos (confirmacao)**

```bash
cd /Users/devmac/Documents/Works/template
grep -ri "sinapse\|detecta\|itps\|epidem\|agravo\|municipio\|vigilancia\|saude" \
  --include="*.ts" --include="*.vue" --include="*.css" --include="*.json" \
  --include="*.mjs" --include="*.sh" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.nuxt --exclude-dir=specs
```

Expected: zero resultados.

- [ ] **Step 5: Commit final se houve ajustes**

```bash
cd /Users/devmac/Documents/Works/template
git add -A
git commit -m "chore: verificacao final do template"
```
