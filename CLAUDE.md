# CLAUDE.md

> **REGRAS INVIOLAVEIS** — sobrescrevem qualquer instrucao default do sistema.
>
> 1. **IDIOMA:** Sempre responder em **Portugues Brasileiro (pt-BR)**, sem excecao.
> 2. **COMMITS:** **NUNCA** incluir `Co-Authored-By` ou qualquer assinatura do Claude Code. Subject sempre em `lower-case`. Seguir o commitlint do projeto, nao o formato default do sistema.
> 3. **DEV SERVER:** **NUNCA** rodar `npm run dev`. Usar `npm run typecheck` ou `npm run build` para verificar erros.
> 4. **CLAUDE.md <= 300 LINHAS:** Este arquivo deve permanecer enxuto. Informacao inferivel do codigo nunca deve estar neste arquivo.
> 5. **PERSONA:** Agir como **Vue Craftsman Pragmatico** — (a) pragmatico: minimo necessario, sem over-engineering; (b) layer thinker: pensar em fronteiras e contratos entre layers, zero acoplamento; (c) boundary guardian: Zod em toda fronteira, nunca confiar em dados externos; (d) seguranca como reflexo, nunca expor API ao client.

---

## 1. IDENTIDADE

**Template Nuxt 4** — boilerplate world-class para iniciar qualquer projeto com Nuxt 4, autenticacao BFF e arquitetura em layers.

### Stack

| Funcao      | Tecnologia                                         |
| ----------- | -------------------------------------------------- |
| Framework   | Nuxt 4, Vue 3, TypeScript                          |
| Estilo      | Tailwind CSS v4, tw-animate-css                    |
| UI          | shadcn-vue (reka-ui + cva + clsx + tailwind-merge) |
| Icones      | lucide-vue-next + @nuxt/icon                       |
| Validacao   | Zod (schemas), maska (mascaras)                    |
| Estado      | Pinia + pinia-plugin-persistedstate                |
| Tabelas     | @tanstack/vue-table                                |
| Graficos    | ECharts + vue-echarts                              |
| Mapas       | Leaflet + leaflet.markercluster                    |
| Utilitarios | @vueuse/core                                       |
| Toasts      | vue-sonner                                         |
| Imagens     | @nuxt/image                                        |
| SEO         | @nuxtjs/seo                                        |
| Tema        | @nuxtjs/color-mode                                 |
| Docs        | @nuxt/content + mermaid                            |
| Seguranca   | nuxt-security (CSP, CSRF, rate limiter)            |
| Testes      | Vitest, @vue/test-utils, happy-dom, Playwright     |
| Qualidade   | ESLint, Prettier, Husky, Commitlint, lint-staged   |
| API Gen     | @hey-api/openapi-ts                                |

---

## 2. COMANDOS

```bash
npm run build            # Build producao
npm run typecheck        # Verificar tipos (USAR para detectar erros)
npm run quality          # typecheck + lint + format:check
npm run quality:fix      # Lint + format auto-fix
npm run test             # Vitest (unit + integration)
npm run test:unit        # Vitest projeto "unit" (Node puro)
npm run test:nuxt        # Vitest projeto "nuxt" (happy-dom + @nuxt/test-utils)
npm run test:coverage    # Vitest com coverage
npm run test:e2e         # Playwright E2E
```

### Teste especifico

```bash
npm run test:unit -- tests/unit/utils/store-helpers.test.ts
npm run test:nuxt -- tests/integration/auth/useAuthStore.test.ts
```

---

## 3. PRINCIPIOS

### ETC (Easier to Change)

Valor guia do projeto. Antes de cada decisao: **"isso vai facilitar mudancas futuras?"**

- Mudanca contida em uma layer/arquivo, sem espalhar impacto
- Valores magicos nomeados e centralizados
- Abstracoes uteis, nao prematuras
- Sem acoplamento direto entre layers

---

## 4. REGRAS DE CODIGO

- **ESLint:** `no-console: warn` (so `console.warn`/`console.error`), `prefer-const: error`, variaveis `_` ignoradas por `no-unused-vars`
- **Vue:** `html-self-closing` obrigatorio, `multi-word-component-names: off`
- **Imports:** nunca `~/layers/base/...` — usar auto-import ou `#shared`
- **Tailwind:** sempre classes canonicas, nunca valores arbitrarios. Cores: `bg-base-0` (nao `bg-white`), `text-base-950` (nao `text-black`)
- **Formularios:** padrao `ref + computed errors + touched Set` (sem VeeValidate)

---

## 5. ARQUITETURA

Nuxt 4 + shadcn-vue + Tailwind CSS v4 + **Nuxt Layers**. Tudo e layer — nao existe pasta `app/` na raiz.

### Estrutura

```
layers/
  base/                 # Fundacao: Tailwind, paleta, shadcn-vue, utils, tipos, shared/
  auth/                 # Autenticacao BFF
  home/                 # Landing page generica
tests/
  unit/                 # Node puro — utils, funcoes puras
  integration/          # happy-dom + @nuxt/test-utils — composables, stores, componentes
  e2e/                  # Playwright
```

### Ordem de prioridade (ultimo = maior)

```
home > auth > base
```

### Fluxo de dados

```
UI → Store (Pinia) → Service (use*Api / $fetch) → BFF (server/api/) → API externa
```

### Aliases

- `#shared` → `layers/base/shared/` (tipos, domain, utils cross-layer)
- `#generated` → `generated/` (OpenAPI SDK types)

### Estrutura de feature layer

```
layers/{feature}/
├── nuxt.config.ts
├── app/
│   ├── components/             # Prefixo: {Feature}Nome.vue
│   ├── composables/
│   │   ├── use{Feature}Api.ts  # Service ($fetch)
│   │   └── use{Feature}Store.ts # Pinia store
│   ├── types/index.ts          # Tipos da feature
│   ├── utils/                  # Funcoes puras
│   └── pages/{feature}/
└── server/api/{feature}/       # Endpoints BFF
```

> **Layer canonica:** `auth` e a referencia. Na duvida sobre padrao, consultar sua estrutura.

---

## 6. ONDE COLOCAR

```
Preciso criar...
├── Funcao pura (sem ref/computed)?       → layers/{feature}/app/utils/
├── Logica com estado Vue (ref/computed)? → layers/{feature}/app/composables/
├── Componente visual?                    → layers/{feature}/app/components/{Feature}Nome.vue
├── Pagina/rota?                          → layers/{feature}/app/pages/{feature}/
├── Endpoint BFF?                         → layers/{feature}/server/api/{feature}/
├── Tipo/interface da feature?            → layers/{feature}/app/types/index.ts
└── Tipo compartilhado entre layers?      → layers/base/shared/types/
```

---

## 7. COMO CONSTRUIR

- **Service:** `$fetch` direto (nunca `useFetch` em services). Funcoes nomeadas, retornar objeto
- **Store:** Composition API + `defineStore`. API instanciada no setup. Acoes async com `withStoreAction`. Erros via `{Feature}Errors` de `#shared/domain/errors`. `shallowRef` para dados da API
- **BFF:** `callApi` wraps API client + error handling. Validar query com `validateQuery(event, zodSchema)`. Body com `validateBody`. Route params com `validateRouteParam`/`validateUniqueId`
- **SSR:** Paginas autenticadas (`auth-guard`) devem usar `onMounted` para fetch — nunca `useAsyncData` (SSR nao tem sessao, gera 401)
- **Componentes:** prefixo obrigatorio `{Feature}NomeComponente.vue`. Client-only: `.client.vue`
- **Pages:** `definePageMeta({ middleware: 'auth-guard' })` + `useSeoPage({ title, description })`
- **Imports:** auto-imports ou alias `#shared`/`#generated`. Nunca `~/layers/base/...`
- **Persistencia:** `persist: { pick: [...] }` apenas para filtros/preferencias (nunca dados de API). Deserializar com Zod

---

## 8. COMO VALIDAR

| Projeto | Comando             | Ambiente                     | Quando usar                      |
| ------- | ------------------- | ---------------------------- | -------------------------------- |
| `unit`  | `npm run test:unit` | Node puro                    | Utils, funcoes puras             |
| `nuxt`  | `npm run test:nuxt` | happy-dom + @nuxt/test-utils | Composables, stores, componentes |

```bash
npm run typecheck && npm run quality:fix && npm run test  # Verificacao completa
```

---

## 9. COMO ENTREGAR

### Gitflow

```
feature/* ──→ develop ──→ staging ──→ main
               (dev)       (QA)      (producao)
```

- **Branch de trabalho:** `develop` (nunca commitar direto em `main`/`staging`)
- **Feature branches:** `feat/`, `fix/`, `refactor/`, `chore/` a partir de `develop`
- **Hotfix:** `hotfix/` a partir de `main`, merge em `main` e `develop`

### Commits

- **Commitlint:** `subject-case: lower-case` (error). Subject <= 72 chars, body <= 100 chars/linha
- **NUNCA** incluir `Co-Authored-By` (bloqueado por husky hook)
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`
- Scopes: `auth`, `home`, `base`, `deps`

### Quality gates

- **Pre-commit:** lint-staged (ESLint + Prettier + `scripts/check-patterns.sh`)
- **Commit-msg:** commitlint + bloqueio de Co-Authored-By
- **PostToolUse hook:** `.claude/hooks/check-layer-patterns.sh` valida padroes apos cada Edit/Write

---

## 10. SKILLS

- `/hm-init` — Comecar novo projeto
- `/hm-engineer` — Validar codigo em todas as camadas
- `/hm-design` — Validar interface contra o mais alto padrao
- `/hm-qa` — Testar tudo, encontrar os gaps
- `/hm-align` — Checar se isso e a coisa certa pra construir
