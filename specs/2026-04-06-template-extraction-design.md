# Template Extraction — Design Spec

> Extrair o Detecta Alerta em um template reutilizavel para iniciar novos projetos Nuxt 4 com a mesma arquitetura world-class.

## Decisoes

| Decisao      | Escolha                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------- |
| Onde vive    | Repositorio local em `/Users/devmac/Documents/Works/template/`                                |
| Escopo       | Base + landing page + auth completo                                                           |
| Abordagem    | Fork & Strip com verificacao automatizada (typecheck + quality + test a cada passo)           |
| Identidade   | Hibrido: `.env` (strings), `app.config.ts` (estruturas UI), CSS (cores)                       |
| Dependencias | So core — remove leaflet, echarts, tanstack, content, hey-api, maska, mermaid, better-sqlite3 |
| Documentacao | `CLAUDE.md` para IA + `README.md` para humanos                                                |
| Origem       | Copia de `/Users/devmac/Documents/Works/detecta-alerta/` (intocado)                           |

---

## 1. Estrutura final do template

```
template/
├── layers/
│   ├── base/
│   │   ├── nuxt.config.ts
│   │   ├── app/
│   │   │   ├── app.vue
│   │   │   ├── error.vue
│   │   │   ├── assets/css/main.css        # Paleta placeholder (indigo/sky)
│   │   │   ├── components/
│   │   │   │   ├── common/                # AppHeader, AppFooter, LoaderLosango, LoadingSpinner,
│   │   │   │   │                          # PlaceholderBox, SimplePagination, DeleteConfirmDialog,
│   │   │   │   │                          # ErrorPageBackground, ErrorPageContent
│   │   │   │   └── ui/                    # 18+ primitivos shadcn-vue (intactos)
│   │   │   ├── composables/
│   │   │   │   ├── useNavigation.ts
│   │   │   │   ├── useSeoPage.ts          # SITE_NAME/DESC de runtimeConfig.public
│   │   │   │   └── useVoField.ts
│   │   │   ├── layouts/
│   │   │   │   ├── default.vue
│   │   │   │   └── fullscreen.vue
│   │   │   ├── types/index.ts
│   │   │   └── utils/
│   │   │       ├── store-helpers.ts       # withStoreAction
│   │   │       ├── error.ts               # extractErrorMessage, isUnauthorizedError
│   │   │       ├── utils.ts               # cn (tailwind-merge + clsx)
│   │   │       ├── date.ts
│   │   │       ├── email.ts
│   │   │       ├── escape-html.ts
│   │   │       └── format-time-ago.ts
│   │   ├── server/
│   │   │   ├── api/health.get.ts
│   │   │   ├── plugins/csp-report-only.ts
│   │   │   └── utils/
│   │   │       ├── api-client.ts          # createApiClient (ex-sinapse-client)
│   │   │       ├── api-sdk.ts             # callApi, callPublicApi (ex-sinapse-sdk)
│   │   │       ├── logger.ts              # Tag lida de config
│   │   │       └── validation.ts          # validateBody, validateQuery, validateRouteParam, validateUniqueId
│   │   └── shared/
│   │       ├── domain/
│   │       │   ├── errors.ts              # AuthErrors + ValidationErrors (so esses)
│   │       │   └── result.ts              # Result<T,E>, ok(), fail(), combineResults(), unwrap()
│   │       ├── types/                     # Vazio (cada projeto cria os seus)
│   │       └── utils/
│   │           └── auth-constants.ts      # ADMIN_GROUP = 'admin' (generico)
│   ├── auth/
│   │   ├── nuxt.config.ts
│   │   ├── app/
│   │   │   ├── components/               # AuthLogin.vue, AuthResetPassword.vue, etc.
│   │   │   ├── composables/
│   │   │   │   ├── useAuthApi.ts
│   │   │   │   └── useAuthStore.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.global.ts
│   │   │   │   └── auth-guard.ts
│   │   │   ├── pages/auth/
│   │   │   ├── types/
│   │   │   │   ├── index.ts              # AuthUser, LoginCredentials, LoginResponse, etc.
│   │   │   │   └── schemas.ts            # Zod schemas de login response (ex-sinapse/auth)
│   │   │   └── utils/
│   │   │       └── user-model.ts         # UserModel, createUserModel, userHasPermission
│   │   └── server/
│   │       ├── api/auth/                 # login, logout, me, refresh
│   │       ├── middleware/
│   │       │   ├── 01.auth.ts
│   │       │   └── 02.admin.ts
│   │       └── utils/
│   │           ├── auth.ts               # parseJwt, isTokenExpired, tryRefreshTokens
│   │           └── login-usecase.ts      # Result<LoginOutput> com callPublicApi
│   └── home/
│       ├── nuxt.config.ts                # Vazio
│       └── app/
│           ├── components/
│           │   └── HomeHero.vue          # Hero generico, dados de runtimeConfig
│           └── pages/
│               └── index.vue             # Landing page simples
├── tests/
│   ├── unit/
│   │   ├── domain/                       # result.ts, errors.ts
│   │   ├── base/                         # store-helpers, error, date, email, escape-html
│   │   ├── auth/                         # user-model, auth-server-utils, login-usecase
│   │   └── bff/                          # validation, endpoints auth
│   ├── integration/
│   │   ├── auth/                         # AuthStore, auth-guard, formularios
│   │   └── composables/                  # useSeoPage
│   └── e2e/
│       └── auth/                         # Login flow
├── scripts/
│   └── check-patterns.sh                # 5 checks bloqueantes (intacto)
├── public/
│   ├── brand/
│   │   ├── logo-default.svg             # Placeholder
│   │   └── logo-light.svg              # Placeholder
│   ├── favicon.svg                      # Placeholder
│   └── og-image.png                     # Placeholder
├── nuxt.config.ts                       # Parametrizado (3 layers, env vars, security sane defaults)
├── app.config.ts                        # Identidade UI (nav, logos, footer)
├── .env.example
├── package.json                         # So dependencias core
├── tsconfig.json
├── vitest.config.ts                     # 2 projetos (unit + nuxt), sem #generated
├── playwright.config.ts                 # 7 targets, auth setup, 1920x1200
├── Dockerfile                           # Multi-stage simplificado (sem python3/make/g++)
├── eslint.config.mjs
├── .prettierrc
├── commitlint.config.js
├── .editorconfig
├── components.json                      # shadcn-vue config
├── CLAUDE.md                            # Documentacao para IA (12 secoes)
└── README.md                            # Setup e guia para humanos
```

---

## 2. Configuracao de identidade

### `.env.example`

```env
# API Backend
NUXT_API_BASE_URL=http://localhost:8000
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Site
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_NAME=Meu Projeto
NUXT_PUBLIC_SITE_DESCRIPTION=Descricao do projeto
```

### `app.config.ts`

```ts
export default defineAppConfig({
  brand: {
    logo: {
      default: '/brand/logo-default.svg',
      light: '/brand/logo-light.svg'
    },
    favicon: '/favicon.svg'
  },
  nav: [{ label: 'inicio', to: '/', icon: 'lucide:house' }],
  footer: {
    copyright: '© {year} Sua Empresa',
    address: '',
    social: [],
    links: []
  }
})
```

### CSS (`main.css`) — paleta placeholder

Mesma estrutura de 3 camadas (primitives → semantic → bridge shadcn), com valores placeholder:

```css
/* ========================================
   PALETA DA MARCA — troque os valores abaixo
   ======================================== */
--color-primary-500: #6366f1; /* placeholder indigo */
--color-secondary-500: #0ea5e9; /* placeholder sky */
```

### Mapa de leitura

| Dado         | Origem                               | Consumidor                     |
| ------------ | ------------------------------------ | ------------------------------ |
| Nome do site | `runtimeConfig.public.siteName`      | `useSeoPage`, `nuxt.config.ts` |
| URL do site  | `runtimeConfig.public.siteUrl`       | `useSeoPage`, SEO meta         |
| Logos        | `appConfig.brand.logo`               | `AppHeader`, `AppFooter`       |
| Navegacao    | `appConfig.nav`                      | `AppHeader`                    |
| Footer       | `appConfig.footer`                   | `AppFooter`                    |
| Cores        | CSS tokens em `main.css`             | Design system inteiro          |
| API URL      | `runtimeConfig.apiBaseUrl` (private) | `createApiClient` no server    |

---

## 3. Layer base — operacoes de extracao

### Remover (arquivos inteiros)

- `shared/types/sinapse/` (7 arquivos — contratos API Sinapse)
- `shared/utils/brazil-constants.ts`
- `shared/utils/epidemiological-helpers.ts`
- `shared/utils/semana-epidemiologica.ts`
- `shared/utils/date-formatters.ts` (acoplado a semana epidemiologica)
- `app/composables/useRegionStats.ts`
- `app/composables/useMapCore.ts`, `useMapLayers.ts`, `useMapMarkers.ts`
- `app/components/common/MapSinapseStatus.vue`, `MapZoom.vue`, `MapNavigation.vue`
- `app/utils/map-colors.ts`, `map-config.ts`, `map-cluster.ts`
- `app/utils/chart-colors.ts`
- `app/utils/button-variants.ts` — verificar se e usado por componentes que ficam. Se nao, remover.
- `app/utils/format-variation.ts` — verificar se e usado por componentes que ficam. Se nao, remover.
- `app/utils/constants.ts` (NAV_LINKS migra pra app.config, ESTADOS_BR removido. Se sobrar algo generico, manter; senao, remover o arquivo)

### Renomear

| De                               | Para                         |
| -------------------------------- | ---------------------------- |
| `server/utils/sinapse-client.ts` | `server/utils/api-client.ts` |
| `server/utils/sinapse-sdk.ts`    | `server/utils/api-sdk.ts`    |
| `createSinapseClient`            | `createApiClient`            |
| `callSinapse`                    | `callApi`                    |
| `callSinapsePublic`              | `callPublicApi`              |
| `NUXT_SINAPSE_API_URL`           | `NUXT_API_BASE_URL`          |
| `sinapseApiUrl` (runtimeConfig)  | `apiBaseUrl`                 |

### Refatorar

| Arquivo                               | Mudanca                                                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `shared/domain/errors.ts`             | Manter so `AuthErrors` + `ValidationErrors` + mensagens de sucesso do auth. Remover HomeErrors, LugaresErrors, RumoresErrors, etc. |
| `shared/utils/auth-constants.ts`      | `ADMIN_GROUP = 'administradores'` → `'admin'`                                                                                      |
| `app/composables/useSeoPage.ts`       | `SITE_NAME` e `DEFAULT_DESCRIPTION` lidos de `useRuntimeConfig().public`                                                           |
| `app/components/common/AppHeader.vue` | Logos e nav de `useAppConfig()`                                                                                                    |
| `app/components/common/AppFooter.vue` | Tudo de `useAppConfig()`                                                                                                           |
| `server/utils/logger.ts`              | `tag: 'detecta'` → tag lida de config ou package.json name                                                                         |
| `app/error.vue`                       | Remove `'Detecta Alerta'` do titulo                                                                                                |

---

## 4. Layer auth — portabilidade

### Fica intacto

- `server/utils/auth.ts` — parseJwt, isTokenExpired, shouldRefreshToken, tryRefreshTokens
- `server/middleware/01.auth.ts`, `02.admin.ts`
- `app/composables/useAuthApi.ts`, `useAuthStore.ts`
- `middleware/auth.global.ts`, `auth-guard.ts`
- `utils/user-model.ts` — UserModel, createUserModel, userHasPermission, userHasGroup

### Muda

| Arquivo                         | Mudanca                                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `server/utils/login-usecase.ts` | Troca chamadas SDK Sinapse por `callPublicApi` generico. Zod schemas importados de `layers/auth/app/types/schemas.ts` |
| `app/types/index.ts`            | Remove import de `#shared/types/sinapse/auth`. `LoginCredentials` definido localmente                                 |
| `app/types/schemas.ts`          | **Novo** — Zod schemas de login response e token (extraidos de `shared/types/sinapse/auth.ts`)                        |

### Para conectar novo backend

1. Editar `login-usecase.ts` — trocar chamadas SDK
2. Ajustar `schemas.ts` — Zod schemas do response
3. Ajustar `AuthUser` em `types/index.ts` se formato diferir

---

## 5. Layer home — landing page

```
layers/home/
├── nuxt.config.ts          # Vazio
└── app/
    ├── components/
    │   └── HomeHero.vue     # Titulo/descricao de runtimeConfig, CTA login
    └── pages/
        └── index.vue        # Landing page com useSeoPage
```

- Sem dashboard, mapas, graficos ou tabelas
- Sem fetch de API — pagina estatica
- Auth-aware — se logado, redireciona ou mostra conteudo diferente

---

## 6. Configuracoes raiz

### `nuxt.config.ts`

- `extends`: 3 layers (base, auth, home)
- `site.url`/`site.name`: de env vars
- `schemaOrg.identity`: valores placeholder ou de `app.config.ts`
- `routeRules`: so `/api/auth/**` com rate limit
- `runtimeConfig.apiBaseUrl`: (ex-sinapseApiUrl)
- Security (CSP, CSRF, headers): mantido intacto
- Remove `build.transpile` de echarts

### `package.json`

**Core mantido:** nuxt, vue, tailwindcss v4, shadcn-vue deps (reka-ui, cva, clsx, tailwind-merge), pinia + persistedstate, @vueuse/core, zod, nuxt-security, vue-sonner, lucide-vue-next, @nuxtjs/color-mode, @nuxtjs/seo, @nuxt/image, @nuxt/icon, consola.

**Dev mantido:** vitest, @vue/test-utils, happy-dom, @nuxt/test-utils, playwright, eslint, prettier, husky, lint-staged, commitlint, typescript.

**Removido:** leaflet, echarts, vue-echarts, @tanstack/vue-table, @nuxt/content, better-sqlite3, @hey-api/openapi-ts, @hey-api/client-fetch, maska, mermaid.

### Dockerfile

Multi-stage simplificado — sem python3/make/g++ (eram para better-sqlite3). Labels com valores placeholder. Porta 5173 como default.

### Vitest

2 projetos (unit + nuxt). Remove alias `#generated`. Mantem `#shared`, `~`. Coverage 80%.

### Playwright

7 targets. Auth setup pattern. Viewport 1920x1200. Remove fixtures especificas do Detecta.

---

## 7. Testes que sobrevivem

### Unit (Node puro)

| Area                                              | O que testa                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| `domain/result.ts`                                | ok, fail, combineResults, unwrap, unwrapOr                        |
| `domain/errors.ts`                                | AuthErrors e ValidationErrors existem e sao `as const`            |
| `server/utils/validation.ts`                      | validateBody, validateQuery, validateRouteParam, validateUniqueId |
| `app/utils/store-helpers.ts`                      | withStoreAction (loading, error, defaultValue, overloads)         |
| `app/utils/error.ts`                              | extractErrorMessage, isUnauthorizedError                          |
| `app/utils/date.ts`, `email.ts`, `escape-html.ts` | Utils puros                                                       |
| `auth/server/utils/login-usecase.ts`              | Fluxo ok/fail com mocks de callPublicApi                          |
| `auth/server/utils/auth.ts`                       | parseJwt, isTokenExpired, shouldRefreshToken                      |

### Integration (happy-dom + @nuxt/test-utils)

| Area                        | O que testa                  |
| --------------------------- | ---------------------------- |
| `auth/useAuthStore.ts`      | Login, logout, sessao        |
| `auth/auth-guard.ts`        | Redirecionamento, permissoes |
| `composables/useSeoPage.ts` | Meta tags, titulo, og:image  |

### E2E (Playwright)

| Area         | O que testa                             |
| ------------ | --------------------------------------- |
| `auth/login` | Login flow, redirect, sessao persistida |

### Adaptacoes nos testes

- `callSinapse` → `callApi` em mocks
- Imports de `#shared/types/sinapse/` → `layers/auth/app/types/schemas.ts`
- URL `alerta.sinapse.org.br` → URL placeholder nos asserts

---

## 8. Documentacao

### `CLAUDE.md` — 12 secoes

1. **Identidade** — nome, stack, proposito (placeholder)
2. **Comandos** — scripts npm
3. **Principios** — ETC, pragmatismo, boundary guardian
4. **Regras de codigo** — ESLint, Vue, imports, Tailwind, formularios
5. **Arquitetura** — layers, estrutura, aliases, fluxo de dados
6. **Onde colocar** — arvore de decisao
7. **Como construir** — service, store, BFF, SSR, componentes, pages
8. **Como criar uma nova feature layer** — passo a passo completo (10+ steps)
9. **Como conectar um novo backend** — guia de integracao
10. **Como validar** — tabela unit vs nuxt
11. **Como entregar** — gitflow, commits, quality gates
12. **Padroes de referencia** — exemplos inline de cada padrao (BFF, store, componente, teste)

### `README.md`

- Quick start (3 passos: copiar, editar .env/app.config/css, npm install)
- Estrutura de diretorios
- Guia de customizacao (paleta, logos, backend, primeira feature)
- Tabela de scripts
- Tabela de stack com links

---

## 9. Processo de extracao

Abordagem: Fork & Strip com verificacao automatizada.
Diretorio de trabalho: `/Users/devmac/Documents/Works/template/`
Origem: `/Users/devmac/Documents/Works/detecta-alerta/` (nunca modificado)

### Ordem de execucao

1. **Copiar repositorio** — `rsync` do detecta-alerta para template/ (sem .git, sem node_modules, sem .nuxt)
2. **Inicializar git** — `git init` no template
3. **Remover layers de feature** — meu-municipio, lugares-monitorados, usuarios, rumores, relatorios, docs
4. **Verificar** — `npm run typecheck`
5. **Remover arquivos de dominio do base** — shared/types/sinapse, utils epidemiologicos, composables de mapa, componentes de mapa
6. **Verificar** — `npm run typecheck`
7. **Renomear sinapse → api** — api-client.ts, api-sdk.ts, callApi, createApiClient
8. **Verificar** — `npm run typecheck`
9. **Refatorar identidade** — useSeoPage, AppHeader, AppFooter, error.vue, constants.ts → app.config.ts
10. **Criar app.config.ts e .env.example**
11. **Verificar** — `npm run typecheck`
12. **Refatorar auth** — mover schemas, genericizar login-usecase
13. **Verificar** — `npm run typecheck`
14. **Simplificar home** — substituir dashboard por landing page simples
15. **Verificar** — `npm run typecheck`
16. **Limpar package.json** — remover deps opcionais, npm install
17. **Limpar nuxt.config.ts** — extends, routeRules, runtimeConfig
18. **Verificar** — `npm run typecheck && npm run quality`
19. **Adaptar testes** — remover testes de features, adaptar mocks
20. **Verificar** — `npm run typecheck && npm run quality && npm run test`
21. **Limpar assets** — trocar logos por placeholders, remover imagens de dominio
22. **Paleta placeholder** — trocar cores no main.css
23. **Simplificar Dockerfile** — remover steps de better-sqlite3
24. **Escrever CLAUDE.md** do template
25. **Escrever README.md**
26. **Grep final** — buscar residuos: `sinapse`, `detecta`, `itps`, `epidem`, `agravo`, `municipio`
27. **Verificacao final** — `npm run typecheck && npm run quality && npm run test`
28. **Commit inicial**

### Verificacao de residuos (step 26)

```bash
grep -ri "sinapse\|detecta\|itps\|epidem\|agravo\|municipio\|vigilancia\|saude" \
  --include="*.ts" --include="*.vue" --include="*.css" --include="*.json" \
  --include="*.md" --include="*.mjs" --include="*.sh" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.nuxt
```

Zero resultados = template limpo.

---

## 10. Diferenciais do template vs mercado

Validados por pesquisa (comparacao com Sidebase, Nuxt UI Pro, Nuxt Starter Kit):

1. **`withStoreAction`** — padrao inexistente no mercado, elimina 90% do boilerplate de stores
2. **BFF tipado (`callApi`)** — wrapper generico com auth + error handling + client creation, nenhum template replica
3. **Erros tipados centralizados** — const objects + type unions com autocomplete perfeito
4. **Nuxt layers + shadcn-vue + Tailwind v4 + BFF + Pinia patterns** — nenhum template combina tudo isso num pacote coeso
