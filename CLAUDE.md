# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Sempre responda em Português Brasileiro (pt-BR).

## Git

- Não incluir `Co-Authored-By` nos commits
- Mensagens de commit em português ou inglês (consistente com o projeto)
- Conventional Commits obrigatório (commitlint enforced): `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`
- Pre-commit hooks (Husky + lint-staged) rodam ESLint + Prettier automaticamente

## Comandos

```bash
# Setup inicial (primeiro uso)
npm install
npm run setup        # Configura git hooks (Husky)

# Desenvolvimento
npm run dev          # Servidor dev http://localhost:3000
npm run build        # Build produção
npm run preview      # Preview do build

# Qualidade de código
npm run lint:fix     # Corrigir ESLint
npm run format       # Formatar com Prettier
npm run typecheck    # Verificar tipos
npm run quality      # Rodar todas as verificações (typecheck + lint + format:check)
npm run quality:fix  # Corrigir lint + formatar

# Testes
npm run test:run           # Vitest (uma execução)
npm run test -- path/to/file.test.ts  # Executar teste específico
npm run test:e2e           # Playwright E2E
npm run test:e2e:install   # Instala browsers (primeiro uso)
```

## Componentes shadcn-vue

```bash
npx shadcn-vue@latest add <componente>
```

Componentes ficam em `layers/0-base/app/components/ui/` (auto-import).

## Arquitetura

Nuxt 4 + shadcn-vue + Tailwind CSS v4 + **Nuxt Layers**.

**Tudo é layer** - não existe pasta `app/` nem `server/` na raiz. Arquitetura layers-only.

### Estrutura Principal

```
layers/                 # TUDO fica aqui (layers-only)
  0-base/               # Fundação + UI: app.vue, CSS, shadcn-vue, utils, shared/types
  1-example/            # Feature layer de exemplo (copiar para novas)
tests/                  # unit/, nuxt/, e2e/
```

> **Arquitetura layers-only:** API routes ficam dentro de cada layer em `layers/*/server/`.

> Use hífen (`-`) no nome das layers, não ponto. Layers em `~/layers` são auto-registradas.

**Caminhos em layers:** Use `~/layers/...` (alias da raiz) para referenciar arquivos em `nuxt.config.ts` de layers. Caminhos relativos como `./app/...` não funcionam.

### Alias `#shared`

Tipos compartilhados entre client e server ficam em `layers/0-base/shared/types/`. Importar via:

```typescript
import type { ApiResponse } from '#shared/types'
```

### Ordem de Prioridade (Layers)

```
1-example > 0-base
```

Número maior = maior prioridade = sobrescreve layers anteriores.

### Fluxo de Dados

```
UI → Composable/Store → Service → API
```

### Estrutura de uma Feature Layer

```
layers/{N}-{feature}/
├── nuxt.config.ts              # Obrigatório (pode ser vazio)
├── app/
│   ├── components/             # Prefixar: {Feature}Card.vue
│   ├── composables/
│   │   ├── types.ts            # Interfaces
│   │   ├── use{Feature}Api.ts  # Service ($fetch)
│   │   └── use{Feature}Store.ts # Pinia store
│   └── pages/{feature}/
└── server/api/{feature}/       # CRUD endpoints
```

## Testes

Dois ambientes Vitest configurados com comportamentos diferentes:

| Pasta | Ambiente | Auto-imports Nuxt | Quando usar |
|-------|----------|-------------------|-------------|
| `tests/unit/` | Node puro (rápido) | Não | Funções puras, utils, validadores |
| `tests/nuxt/` | Runtime Nuxt (lento) | Sim | Composables, stores, componentes |
| `tests/e2e/` | Playwright (browser) | N/A | Fluxos completos, navegação |

> Playwright: WebKit/Safari roda apenas no CI. Localmente testa Chromium, Firefox e Mobile Chrome.

## Padrões de Código

### Service (API)

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
  const api = useExampleApi() // Instanciar no setup

  async function fetchAll() {
    items.value = await api.getAll()
  }

  return { items, fetchAll }
})
```

### Data Fetching

| Método | Quando usar | SSR |
|--------|-------------|-----|
| `useFetch` | Carregamento inicial (páginas) | Sim |
| `$fetch` | Eventos do usuário (cliques) | Não |

### Utils vs Composables

- **Utils** (`layers/0-base/app/utils/`): Funções puras, sem estado Vue
- **Composables** (`layers/{N}-{feature}/app/composables/`): Lógica com `ref`, `computed`

### Formulários (VeeValidate)

Componentes renomeados no projeto: `VeeForm`, `VeeField`, `VeeFieldArray`, `VeeErrorMessage`.

```typescript
import { toTypedSchema } from '@vee-validate/zod'

const schema = toTypedSchema(z.object({
  email: z.string().email(),
}))
```

### Ícones (@nuxt/icon)

```vue
<Icon name="lucide:home" />
```

## Variáveis de Ambiente

Nunca usar `import.meta.env` no `nuxt.config.ts`. Usar defaults no `runtimeConfig` e override via env vars com prefixo `NUXT_`:

```typescript
// nuxt.config.ts
runtimeConfig: {
  apiExternalBaseUrl: 'http://localhost:8000',  // NUXT_API_EXTERNAL_BASE_URL
  public: {
    apiBaseUrl: '/api',                          // NUXT_PUBLIC_API_BASE_URL
  }
}
```

```typescript
// No código — acessar via useRuntimeConfig()
const config = useRuntimeConfig()
config.apiExternalBaseUrl        // server-only
config.public.apiBaseUrl         // client + server
```

## Segurança

Módulos `nuxt-security` e `nuxt-csurf` já configurados.

```typescript
// Tokens em cookies httpOnly (nunca localStorage)
setCookie(event, 'token', value, { httpOnly: true, secure: true, sameSite: 'strict' })

// SEMPRE validar no servidor com Zod
const result = schema.safeParse(body)
if (!result.success) throw createError({ statusCode: 400 })
```

## Documentação por Diretório

Cada diretório principal tem seu próprio `CLAUDE.md` com instruções específicas:

| Documento | Conteúdo |
|-----------|----------|
| [layers/0-base/CLAUDE.md](layers/0-base/CLAUDE.md) | Fundação, UI, shadcn-vue, utils |
| [layers/1-example/CLAUDE.md](layers/1-example/CLAUDE.md) | Template para criar features |
| [tests/CLAUDE.md](tests/CLAUDE.md) | Vitest, Playwright, mocking |
