# Feature Layer - CLAUDE.md

Guia para criar e estruturar uma nova Feature Layer no Nuxt 4.

---

## O que é uma Feature Layer?

Uma Feature Layer é um módulo isolado que contém toda a lógica de uma funcionalidade específica: páginas, componentes, composables, tipos e API routes.

**Exemplos de Feature Layers:**
- `2-auth` - Autenticação (login, registro, recuperação de senha)
- `3-products` - Catálogo de produtos
- `4-checkout` - Carrinho e pagamento
- `5-admin` - Painel administrativo

---

## Estrutura de uma Feature Layer

```
layers/{N}-{nome-feature}/
├── nuxt.config.ts              # Configuração da layer (obrigatório)
├── CLAUDE.md                   # Documentação da feature (recomendado)
├── app/
│   ├── components/             # Componentes específicos da feature
│   │   └── {Feature}Card.vue   # Prefixar com nome da feature
│   ├── composables/
│   │   ├── types.ts            # Tipos/interfaces da feature
│   │   ├── use{Feature}Api.ts  # Service (chamadas API)
│   │   ├── use{Feature}Store.ts # Store Pinia
│   │   └── use{Feature}Validators.ts # Validadores
│   ├── layouts/                # Layouts específicos (opcional)
│   │   └── {feature}.vue
│   ├── middleware/             # Middleware específico (opcional)
│   │   └── {feature}-guard.ts
│   └── pages/
│       └── {feature}/          # Páginas da feature
│           ├── index.vue       # Rota: /{feature}
│           └── [id].vue        # Rota: /{feature}/:id
└── server/                     # API routes (na RAIZ da layer, não em app/)
    └── api/
        └── {feature}/
            ├── index.get.ts    # GET /api/{feature}
            ├── index.post.ts   # POST /api/{feature}
            └── [id].get.ts     # GET /api/{feature}/:id
```

---

## Passo a Passo: Criar Nova Feature Layer

### 1. Criar estrutura de diretórios

```bash
# Substitua {N} pelo número de prioridade e {feature} pelo nome
mkdir -p layers/{N}-{feature}/{app/{components,composables,pages/{feature}},server/api/{feature}}
```

### 2. Criar nuxt.config.ts

```typescript
// layers/{N}-{feature}/nuxt.config.ts
export default defineNuxtConfig({
  // Configurações específicas da feature (pode estar vazio)
})
```

### 3. Criar tipos (types.ts)

```typescript
// layers/{N}-{feature}/app/composables/types.ts

export interface {Feature} {
  id: string
  name: string
  createdAt: Date
  // ... outros campos
}

export interface Create{Feature}Data {
  name: string
  // ... campos para criação
}

export interface Update{Feature}Data {
  name?: string
  // ... campos para atualização
}
```

### 4. Criar service (API calls)

```typescript
// layers/{N}-{feature}/app/composables/use{Feature}Api.ts

export function use{Feature}Api() {
  // Para dados iniciais (SSR)
  function getAll() {
    return useFetch<{Feature}[]>('/api/{feature}')
  }

  function getById(id: string) {
    return useFetch<{Feature}>(`/api/{feature}/${id}`)
  }

  // Para ações do usuário (client-side)
  async function create(data: Create{Feature}Data) {
    return $fetch<{Feature}>('/api/{feature}', {
      method: 'POST',
      body: data
    })
  }

  async function update(id: string, data: Update{Feature}Data) {
    return $fetch<{Feature}>(`/api/{feature}/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async function remove(id: string) {
    return $fetch(`/api/{feature}/${id}`, {
      method: 'DELETE'
    })
  }

  return { getAll, getById, create, update, remove }
}
```

### 5. Criar store (Pinia)

```typescript
// layers/{N}-{feature}/app/composables/use{Feature}Store.ts

export const use{Feature}Store = defineStore('{feature}', () => {
  // State
  const items = ref<{Feature}[]>([])
  const current = ref<{Feature} | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // API (instanciada no setup para preservar contexto Nuxt)
  const api = use{Feature}Api()

  // Getters
  const count = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)

  // Actions
  async function fetchAll() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.getAll()
      if (data.value) {
        items.value = data.value
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.getById(id)
      if (data.value) {
        current.value = data.value
      }
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    items.value = []
    current.value = null
    error.value = null
  }

  return {
    // State
    items,
    current,
    isLoading,
    error,
    // Getters
    count,
    isEmpty,
    // Actions
    fetchAll,
    fetchById,
    reset
  }
})
```

### 6. Criar página principal

```vue
<!-- layers/{N}-{feature}/app/pages/{feature}/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default'
  // middleware: '{feature}-guard' // Se precisar de proteção
})

const store = use{Feature}Store()

// Carrega dados no servidor (SSR)
await store.fetchAll()
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">{Feature}</h1>

    <!-- Loading -->
    <div v-if="store.isLoading">
      <AppLoading />
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="text-destructive">
      {{ store.error }}
    </div>

    <!-- Empty -->
    <div v-else-if="store.isEmpty" class="text-muted-foreground">
      Nenhum item encontrado.
    </div>

    <!-- List -->
    <div v-else class="grid gap-4">
      <div
        v-for="item in store.items"
        :key="item.id"
        class="p-4 border rounded-lg"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
```

### 7. Criar API route

```typescript
// layers/{N}-{feature}/server/api/{feature}/index.get.ts
export default defineEventHandler(async (event) => {
  // Buscar dados do banco/serviço externo
  return [
    { id: '1', name: 'Item 1', createdAt: new Date() },
    { id: '2', name: 'Item 2', createdAt: new Date() }
  ]
})
```

```typescript
// layers/{N}-{feature}/server/api/{feature}/index.post.ts
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(3).max(100)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validar
  const result = createSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.flatten()
    })
  }

  // Criar no banco/serviço externo
  const created = {
    id: crypto.randomUUID(),
    ...result.data,
    createdAt: new Date()
  }

  setResponseStatus(event, 201)
  return created
})
```

---

## Convenções de Nomenclatura

### Diretórios e Arquivos

| Item | Convenção | Exemplo |
|------|-----------|---------|
| Pasta da layer | `{N}-{kebab-case}` | `3-user-profile` |
| Componentes | `{PascalCase}{Feature}.vue` | `UserProfileCard.vue` |
| Composables | `use{Feature}{Tipo}.ts` | `useUserProfileApi.ts` |
| Páginas | `{kebab-case}/` | `user-profile/index.vue` |
| API routes | `{kebab-case}/` | `user-profile/index.get.ts` |

### Prefixo em Componentes

Sempre prefixe componentes com o nome da feature para evitar conflitos:

```
layers/3-products/app/components/
├── ProductCard.vue        ✓ Prefixo "Product"
├── ProductList.vue        ✓
├── ProductFilter.vue      ✓
└── Card.vue               ✗ Evitar - pode conflitar
```

---

## Ordem de Prioridade

O número no nome da layer define a prioridade de carregamento:

```
1-base      → Menor prioridade (carrega primeiro, pode ser sobrescrito)
2-example   → Prioridade 2
3-products  → Prioridade 3
4-checkout  → Prioridade 4
app/        → Maior prioridade (sempre sobrescreve)
```

**Regra:** Use números menores para layers de infraestrutura e maiores para features de negócio.

---

## Checklist: Nova Feature Layer

- [ ] Pasta criada: `layers/{N}-{feature}/`
- [ ] `nuxt.config.ts` criado
- [ ] Tipos definidos em `app/composables/types.ts`
- [ ] Service criado em `app/composables/use{Feature}Api.ts`
- [ ] Store criado em `app/composables/use{Feature}Store.ts`
- [ ] Página principal em `app/pages/{feature}/index.vue`
- [ ] API routes em `server/api/{feature}/`
- [ ] Componentes prefixados com nome da feature
- [ ] Validação Zod nos endpoints POST/PUT
- [ ] CLAUDE.md documentando a feature (opcional)

---

## Referências

- [Nuxt Layers](https://nuxt.com/docs/getting-started/layers)
- [docs/NUXT_LAYERS.md](../../docs/NUXT_LAYERS.md) - Guia completo de Layers
