# Feature Layer - CLAUDE.md

Guia completo para criar e estruturar uma Feature Layer no Nuxt 4.

> **Esta layer serve como exemplo/template.** Copie-a para criar novas features.

---

## Estrutura Completa de uma Feature Layer

Baseada na [documentação oficial do Nuxt 4](https://nuxt.com/docs/4.x/guide/going-further/layers).

```
layers/{N}-{nome-feature}/
├── nuxt.config.ts                    # Configuração (OBRIGATÓRIO)
├── CLAUDE.md                         # Documentação da feature
│
├── app/                              # Código da aplicação (cliente)
│   ├── components/                   # Componentes Vue
│   │   └── {Feature}Card.vue         # Prefixar com nome da feature
│   │
│   ├── composables/                  # Lógica reativa reutilizável
│   │   ├── types.ts                  # Tipos/interfaces
│   │   ├── use{Feature}Api.ts        # Service (chamadas API)
│   │   ├── use{Feature}Store.ts      # Store Pinia
│   │   ├── use{Feature}Form.ts       # Lógica de formulário
│   │   └── use{Feature}Validators.ts # Validadores
│   │
│   ├── layouts/                      # Layouts específicos
│   │   └── {feature}.vue             # Layout da feature
│   │
│   ├── middleware/                   # Middleware de navegação
│   │   └── {feature}-guard.ts        # Proteção de rotas
│   │
│   ├── pages/                        # Páginas/rotas
│   │   └── {feature}/
│   │       ├── index.vue             # /{feature}
│   │       └── [id].vue              # /{feature}/:id
│   │
│   ├── plugins/                      # Plugins Vue
│   │   └── {feature}.ts              # Inicialização da feature
│   │
│   └── utils/                        # Funções utilitárias (puras)
│       └── {feature}.ts              # Helpers sem estado
│
└── server/                           # Código do servidor (API)
    ├── api/                          # Endpoints da API
    │   └── {feature}/
    │       ├── index.get.ts          # GET /api/{feature}
    │       ├── index.post.ts         # POST /api/{feature}
    │       ├── [id].get.ts           # GET /api/{feature}/:id
    │       ├── [id].put.ts           # PUT /api/{feature}/:id
    │       └── [id].delete.ts        # DELETE /api/{feature}/:id
    │
    ├── middleware/                   # Middleware do servidor
    │   └── {feature}-logger.ts       # Logging, auth, rate limit
    │
    ├── plugins/                      # Plugins Nitro
    │   └── {feature}.ts              # Inicialização do servidor
    │
    └── utils/                        # Utilitários do servidor
        └── {feature}.ts              # Helpers server-side
```

---

## Arquivos desta Layer de Exemplo

| Arquivo | Descrição |
|---------|-----------|
| `nuxt.config.ts` | Configuração da layer |
| **app/components/** | |
| `ExampleCard.vue` | Componente de card com props tipadas |
| **app/composables/** | |
| `types.ts` | Interfaces e tipos TypeScript |
| `useExampleApi.ts` | Service para chamadas à API |
| `useExampleStore.ts` | Store Pinia com estado reativo |
| `useExampleForm.ts` | Lógica de formulário com validação |
| `useExampleValidators.ts` | Funções de validação |
| **app/layouts/** | |
| `example.vue` | Layout específico da feature |
| **app/middleware/** | |
| `example-guard.ts` | Middleware de proteção de rotas |
| **app/pages/example/** | |
| `index.vue` | Página principal (/example) |
| **app/plugins/** | |
| `example.ts` | Plugin de inicialização |
| **app/utils/** | |
| `example.ts` | Funções utilitárias puras |
| **server/api/example/** | |
| `index.get.ts` | GET /api/example |
| `index.post.ts` | POST /api/example |
| `[id].get.ts` | GET /api/example/:id |
| `[id].put.ts` | PUT /api/example/:id |
| `[id].delete.ts` | DELETE /api/example/:id |
| **server/middleware/** | |
| `example-logger.ts` | Logging de requisições |
| **server/plugins/** | |
| `example.ts` | Inicialização do servidor |
| **server/utils/** | |
| `example.ts` | Utilitários server-side |

---

## Criar Nova Feature Layer

### 1. Copiar esta layer

```bash
cp -r layers/2-example layers/{N}-{sua-feature}
```

### 2. Renomear arquivos

Substitua `example` e `Example` pelo nome da sua feature:

```bash
# Exemplo: criar layer "products"
mv app/components/ExampleCard.vue app/components/ProductCard.vue
mv app/composables/useExampleApi.ts app/composables/useProductApi.ts
# ... etc
```

### 3. Atualizar conteúdo

Em cada arquivo, substitua:
- `Example` → `{SuaFeature}` (PascalCase)
- `example` → `{sua-feature}` (kebab-case)
- `EXAMPLE` → `{SUA_FEATURE}` (UPPER_CASE)

### 4. Caminhos no nuxt.config.ts

Se precisar referenciar arquivos (CSS, assets) no `nuxt.config.ts` da layer, use o alias `~`:

```ts
// ✅ Correto
export default defineNuxtConfig({
  css: ['~/layers/3-minha-feature/app/assets/custom.css']
})

// ❌ Incorreto - caminhos relativos não funcionam em layers
export default defineNuxtConfig({
  css: ['./app/assets/custom.css']
})
```

---

## Diretórios: Quando Usar Cada Um

### app/ (Cliente)

| Diretório | Quando usar | Auto-import |
|-----------|-------------|-------------|
| `components/` | UI reutilizável da feature | ✅ Sim |
| `composables/` | Lógica reativa (stores, services) | ✅ Sim |
| `layouts/` | Layout específico da feature | ✅ Sim |
| `middleware/` | Proteção de rotas (auth, roles) | ✅ Sim |
| `pages/` | Rotas/páginas da feature | ✅ Sim |
| `plugins/` | Inicialização, bibliotecas | ✅ Sim |
| `utils/` | Funções puras (formatters, helpers) | ✅ Sim |

### server/ (Servidor)

| Diretório | Quando usar | Auto-import |
|-----------|-------------|-------------|
| `api/` | Endpoints REST | ✅ Sim |
| `middleware/` | Logging, auth, rate limit | ✅ Sim |
| `plugins/` | Conexões DB, inicialização | ✅ Sim |
| `utils/` | Helpers server-side | ✅ Sim |

---

## Convenções de Nomenclatura

### Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente | `{Feature}{Nome}.vue` | `ProductCard.vue` |
| Composable | `use{Feature}{Tipo}.ts` | `useProductApi.ts` |
| Layout | `{feature}.vue` | `product.vue` |
| Middleware | `{feature}-{ação}.ts` | `product-guard.ts` |
| Página | `{feature}/index.vue` | `product/index.vue` |
| API route | `{rota}.{método}.ts` | `index.get.ts` |
| Utils | `{feature}.ts` | `product.ts` |

### Métodos HTTP em API Routes

| Arquivo | Método | Rota |
|---------|--------|------|
| `index.get.ts` | GET | /api/{feature} |
| `index.post.ts` | POST | /api/{feature} |
| `[id].get.ts` | GET | /api/{feature}/:id |
| `[id].put.ts` | PUT | /api/{feature}/:id |
| `[id].patch.ts` | PATCH | /api/{feature}/:id |
| `[id].delete.ts` | DELETE | /api/{feature}/:id |

---

## Ordem de Prioridade das Layers

```
1-base      → Menor prioridade (fundação)
2-example   → Prioridade 2
3-feature-a → Prioridade 3
4-feature-b → Prioridade 4
app/        → Maior prioridade (sobrescreve tudo)
```

**Regra:** Número maior = maior prioridade = sobrescreve anteriores.

---

## Checklist: Nova Feature Layer

### Estrutura Mínima
- [ ] `nuxt.config.ts` criado
- [ ] `app/composables/types.ts` com interfaces
- [ ] `app/composables/use{Feature}Api.ts` com service
- [ ] `app/pages/{feature}/index.vue` com página principal

### Estrutura Completa
- [ ] `app/components/` com componentes prefixados
- [ ] `app/composables/use{Feature}Store.ts` com Pinia
- [ ] `app/layouts/{feature}.vue` se precisar de layout próprio
- [ ] `app/middleware/{feature}-guard.ts` se precisar de proteção
- [ ] `app/plugins/{feature}.ts` se precisar de inicialização
- [ ] `app/utils/{feature}.ts` com helpers
- [ ] `server/api/{feature}/` com endpoints CRUD
- [ ] `server/utils/{feature}.ts` com helpers server-side
- [ ] Validação Zod em todos os POST/PUT
- [ ] CLAUDE.md documentando a feature

---

## Testando a Feature Layer

### Estrutura de Testes

Os testes ficam na pasta `tests/` na raiz do projeto, organizados por tipo:

```
tests/
├── unit/
│   └── {feature}/               # Testes unitários da feature
│       ├── composables/
│       │   ├── use{Feature}Api.test.ts
│       │   └── use{Feature}Store.test.ts
│       └── components/
│           └── {Feature}Card.test.ts
├── integration/
│   └── api/
│       └── {feature}.test.ts    # Testes de API
└── e2e/
    └── {feature}.spec.ts        # Testes E2E
```

### Teste de Composable

```typescript
// tests/unit/example/composables/useExampleStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExampleStore } from '~/layers/2-example/app/composables/useExampleStore'

vi.mock('~/layers/2-example/app/composables/useExampleApi', () => ({
  useExampleApi: () => ({
    getAll: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }])
  })
}))

describe('useExampleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should fetch items', async () => {
    const store = useExampleStore()
    await store.fetchAll()
    expect(store.items).toHaveLength(1)
  })
})
```

### Teste de Componente

```typescript
// tests/unit/example/components/ExampleCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExampleCard from '~/layers/2-example/app/components/ExampleCard.vue'

describe('ExampleCard', () => {
  it('should render title', () => {
    const wrapper = mount(ExampleCard, {
      props: { title: 'Test', description: 'Description' }
    })
    expect(wrapper.text()).toContain('Test')
  })
})
```

### Teste E2E

```typescript
// tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Example Feature', () => {
  test('should display example page', async ({ page }) => {
    await page.goto('/example')
    await expect(page.locator('h1')).toContainText('Example')
  })

  test('should create new item', async ({ page }) => {
    await page.goto('/example')
    await page.click('[data-testid="create-button"]')
    await page.fill('[data-testid="name-input"]', 'New Item')
    await page.click('[data-testid="submit"]')
    await expect(page.locator('[data-testid="item-list"]')).toContainText('New Item')
  })
})
```

### Checklist de Testes

- [ ] Testes unitários para cada composable
- [ ] Testes unitários para componentes com lógica
- [ ] Testes de integração para API routes
- [ ] Testes E2E para fluxos principais

---

## Referências

- [Nuxt 4 Layers](https://nuxt.com/docs/4.x/getting-started/layers)
- [Authoring Nuxt Layers](https://nuxt.com/docs/4.x/guide/going-further/layers)
- [Nuxt 4 Directory Structure](https://nuxt.com/docs/4.x/directory-structure)
- [Nuxt Testing](https://nuxt.com/docs/getting-started/testing)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
