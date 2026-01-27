# TESTING.md

Guia completo de testes para aplicações Nuxt 4 com Vitest e Testing Library.

## Índice

1. [Configuração](#configuração)
2. [Estrutura de Testes](#estrutura-de-testes)
3. [Testes de Componentes](#testes-de-componentes)
4. [Testes de Composables](#testes-de-composables)
5. [Testes de Stores (Pinia)](#testes-de-stores-pinia)
6. [Testes de API Routes](#testes-de-api-routes)
7. [Testes de Validators (Domain)](#testes-de-validators-domain)
8. [Mocking](#mocking)
9. [Testes E2E](#testes-e2e)
10. [Boas Práticas](#boas-práticas)

---

## Configuração

### Instalação

```bash
# Vitest + Nuxt Test Utils
npm install -D @nuxt/test-utils vitest @vue/test-utils happy-dom

# Testing Library (opcional, recomendado)
npm install -D @testing-library/vue
```

### Configuração do Vitest

```typescript
// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        'coverage/'
      ]
    }
  }
})
```

### Scripts no package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### Arquivo de Setup Global

```typescript
// tests/setup.ts
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock global do Nuxt
vi.mock('#app', () => ({
  useNuxtApp: () => ({}),
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: 'http://localhost:3000'
    }
  }),
  navigateTo: vi.fn(),
  useFetch: vi.fn(),
  useAsyncData: vi.fn()
}))

// Configuração global do Vue Test Utils
config.global.stubs = {
  NuxtLink: true,
  ClientOnly: true
}
```

---

## Estrutura de Testes

### Organização Recomendada

```
tests/
├── setup.ts                    # Setup global
├── unit/                       # Testes unitários
│   ├── components/
│   │   └── Button.test.ts
│   ├── composables/
│   │   └── useLoading.test.ts
│   ├── stores/
│   │   └── example.store.test.ts
│   └── domain/
│       └── validators.test.ts
├── integration/                # Testes de integração
│   └── api/
│       └── users.test.ts
└── e2e/                        # Testes end-to-end
    └── login.test.ts
```

### Alternativa: Co-localização

```
app/
├── components/
│   └── ui/
│       ├── Button.vue
│       └── Button.test.ts      # Teste junto do componente
├── composables/
│   ├── useLoading.ts
│   └── useLoading.test.ts
└── modules/
    └── _example/
        └── domain/
            ├── validators.ts
            └── validators.test.ts
```

---

## Testes de Componentes

### Teste Básico com Vue Test Utils

```typescript
// tests/unit/components/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '~/components/ui/Button.vue'

describe('Button', () => {
  it('renderiza o texto do slot', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Clique aqui'
      }
    })

    expect(wrapper.text()).toContain('Clique aqui')
  })

  it('aplica variante corretamente', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'destructive'
      }
    })

    expect(wrapper.classes()).toContain('bg-destructive')
  })

  it('emite evento de click', async () => {
    const wrapper = mount(Button)

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('desabilita o botão quando disabled=true', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
```

### Teste com Testing Library

```typescript
// tests/unit/components/LoginForm.test.ts
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import LoginForm from '~/components/LoginForm.vue'

describe('LoginForm', () => {
  it('renderiza campos de email e senha', () => {
    render(LoginForm)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
  })

  it('mostra erro quando email é inválido', async () => {
    render(LoginForm)

    const emailInput = screen.getByLabelText(/email/i)
    await fireEvent.update(emailInput, 'email-invalido')
    await fireEvent.blur(emailInput)

    expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
  })

  it('chama onSubmit com dados corretos', async () => {
    const onSubmit = vi.fn()
    render(LoginForm, {
      props: { onSubmit }
    })

    await fireEvent.update(screen.getByLabelText(/email/i), 'teste@email.com')
    await fireEvent.update(screen.getByLabelText(/senha/i), 'senha123')
    await fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'teste@email.com',
      password: 'senha123'
    })
  })
})
```

### Teste de Componente com Nuxt Test Utils

```typescript
// tests/unit/components/UserProfile.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UserProfile from '~/components/UserProfile.vue'

describe('UserProfile', () => {
  it('renderiza dados do usuário', async () => {
    const wrapper = await mountSuspended(UserProfile, {
      props: {
        user: {
          id: '1',
          name: 'João Silva',
          email: 'joao@email.com'
        }
      }
    })

    expect(wrapper.text()).toContain('João Silva')
    expect(wrapper.text()).toContain('joao@email.com')
  })
})
```

---

## Testes de Composables

### Composable Simples

```typescript
// app/composables/useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  return { count, increment, decrement }
}
```

```typescript
// tests/unit/composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from '~/composables/useCounter'

describe('useCounter', () => {
  it('inicia com valor padrão 0', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('inicia com valor customizado', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })

  it('incrementa corretamente', () => {
    const { count, increment } = useCounter()

    increment()
    increment()

    expect(count.value).toBe(2)
  })

  it('decrementa corretamente', () => {
    const { count, decrement } = useCounter(5)

    decrement()

    expect(count.value).toBe(4)
  })
})
```

### Composable com Async

```typescript
// tests/unit/composables/useLoading.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useLoading } from '~/composables/useLoading'

describe('useLoading', () => {
  it('inicia com isLoading=false', () => {
    const { isLoading } = useLoading()
    expect(isLoading.value).toBe(false)
  })

  it('withLoading gerencia estado de loading', async () => {
    const { isLoading, withLoading } = useLoading()

    const promise = withLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return 'resultado'
    })

    // Durante a execução
    expect(isLoading.value).toBe(true)

    const result = await promise

    // Após execução
    expect(isLoading.value).toBe(false)
    expect(result).toBe('resultado')
  })

  it('captura erro e define error.value', async () => {
    const { error, withLoading } = useLoading()

    await withLoading(async () => {
      throw new Error('Erro de teste')
    })

    expect(error.value).toBe('Erro de teste')
  })
})
```

### Composable com Debounce

```typescript
// tests/unit/composables/useDebounce.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useDebounce } from '~/composables/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna valor inicial imediatamente', () => {
    const source = ref('inicial')
    const debounced = useDebounce(source, 300)

    expect(debounced.value).toBe('inicial')
  })

  it('debounce atualização de valor', async () => {
    const source = ref('inicial')
    const debounced = useDebounce(source, 300)

    source.value = 'atualizado'
    await nextTick()

    // Ainda não atualizou
    expect(debounced.value).toBe('inicial')

    // Avança o tempo
    vi.advanceTimersByTime(300)
    await nextTick()

    // Agora atualizou
    expect(debounced.value).toBe('atualizado')
  })

  it('cancela debounce anterior quando valor muda', async () => {
    const source = ref('inicial')
    const debounced = useDebounce(source, 300)

    source.value = 'primeiro'
    await nextTick()
    vi.advanceTimersByTime(100)

    source.value = 'segundo'
    await nextTick()
    vi.advanceTimersByTime(300)
    await nextTick()

    // Só o último valor é aplicado
    expect(debounced.value).toBe('segundo')
  })
})
```

---

## Testes de Stores (Pinia)

### Configuração para Pinia

```typescript
// tests/unit/stores/example.store.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExampleStore } from '~/modules/_example/presentation/stores/example.store'

// Mock do useExampleApi
vi.mock('~/modules/_example/services/exampleApi', () => ({
  useExampleApi: () => ({
    getAll: vi.fn().mockResolvedValue([
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' }
    ]),
    create: vi.fn().mockImplementation((data) =>
      Promise.resolve({ id: '3', ...data })
    )
  })
}))

describe('useExampleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inicia com estado vazio', () => {
    const store = useExampleStore()

    expect(store.items).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchAll carrega items', async () => {
    const store = useExampleStore()

    await store.fetchAll()

    expect(store.items).toHaveLength(2)
    expect(store.items[0].name).toBe('Item 1')
  })

  it('create adiciona item à lista', async () => {
    const store = useExampleStore()

    const newItem = await store.create({ name: 'Novo Item' })

    expect(newItem.id).toBe('3')
    expect(store.items).toContainEqual(newItem)
  })

  it('fetchAll define isLoading durante carregamento', async () => {
    const store = useExampleStore()

    const promise = store.fetchAll()

    expect(store.isLoading).toBe(true)

    await promise

    expect(store.isLoading).toBe(false)
  })

  it('getter hasItems retorna true quando tem items', async () => {
    const store = useExampleStore()

    expect(store.hasItems).toBe(false)

    await store.fetchAll()

    expect(store.hasItems).toBe(true)
  })
})
```

---

## Testes de API Routes

### Teste de Endpoint GET

```typescript
// tests/integration/api/users.test.ts
import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('API /api/users', async () => {
  await setup({
    server: true
  })

  it('GET /api/users retorna lista de usuários', async () => {
    const users = await $fetch('/api/users')

    expect(Array.isArray(users)).toBe(true)
  })

  it('GET /api/users/:id retorna usuário específico', async () => {
    const user = await $fetch('/api/users/1')

    expect(user).toHaveProperty('id', '1')
    expect(user).toHaveProperty('name')
  })

  it('GET /api/users/:id retorna 404 para ID inexistente', async () => {
    try {
      await $fetch('/api/users/inexistente')
    } catch (error: any) {
      expect(error.statusCode).toBe(404)
    }
  })
})
```

### Teste de Endpoint POST com Validação

```typescript
// tests/integration/api/users.post.test.ts
import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('POST /api/users', async () => {
  await setup({
    server: true
  })

  it('cria usuário com dados válidos', async () => {
    const newUser = await $fetch('/api/users', {
      method: 'POST',
      body: {
        name: 'João Silva',
        email: 'joao@email.com'
      }
    })

    expect(newUser).toHaveProperty('id')
    expect(newUser.name).toBe('João Silva')
  })

  it('retorna 400 para email inválido', async () => {
    try {
      await $fetch('/api/users', {
        method: 'POST',
        body: {
          name: 'João',
          email: 'email-invalido'
        }
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
      expect(error.data.message).toContain('inválido')
    }
  })

  it('retorna 400 para campos obrigatórios faltando', async () => {
    try {
      await $fetch('/api/users', {
        method: 'POST',
        body: {
          name: 'João'
          // email faltando
        }
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
    }
  })
})
```

### Teste Unitário de Handler

```typescript
// tests/unit/api/health.test.ts
import { describe, it, expect } from 'vitest'
import handler from '~/server/api/health.get'

describe('GET /api/health', () => {
  it('retorna status ok', async () => {
    // Criar evento fake
    const event = {
      context: {},
      node: { req: {}, res: {} }
    } as any

    const result = await handler(event)

    expect(result).toEqual({ status: 'ok' })
  })
})
```

---

## Testes de Validators (Domain)

Validators são funções puras, ideais para testes unitários.

```typescript
// tests/unit/domain/validators.test.ts
import { describe, it, expect } from 'vitest'
import { validateCreateExample, validateEmail } from '~/modules/_example/domain'

describe('validateCreateExample', () => {
  it('retorna válido para dados corretos', () => {
    const result = validateCreateExample('Nome válido', 'Descrição')

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('retorna erro para nome vazio', () => {
    const result = validateCreateExample('', 'Descrição')

    expect(result.isValid).toBe(false)
    expect(result.errors.name).toBe('Nome é obrigatório')
  })

  it('retorna erro para nome muito curto', () => {
    const result = validateCreateExample('ab', 'Descrição')

    expect(result.isValid).toBe(false)
    expect(result.errors.name).toContain('pelo menos 3 caracteres')
  })

  it('retorna erro para nome muito longo', () => {
    const name = 'a'.repeat(101)
    const result = validateCreateExample(name, 'Descrição')

    expect(result.isValid).toBe(false)
    expect(result.errors.name).toContain('máximo 100 caracteres')
  })

  it('retorna erro para descrição muito longa', () => {
    const description = 'a'.repeat(501)
    const result = validateCreateExample('Nome', description)

    expect(result.isValid).toBe(false)
    expect(result.errors.description).toContain('máximo 500 caracteres')
  })

  it('aceita descrição opcional', () => {
    const result = validateCreateExample('Nome válido')

    expect(result.isValid).toBe(true)
  })
})

describe('validateEmail', () => {
  it('aceita email válido', () => {
    const result = validateEmail('teste@email.com')
    expect(result.isValid).toBe(true)
  })

  it('rejeita email sem @', () => {
    const result = validateEmail('testeemail.com')
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBe('Email inválido')
  })

  it('rejeita email vazio', () => {
    const result = validateEmail('')
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBe('Email é obrigatório')
  })
})
```

---

## Mocking

### Mock de $fetch

```typescript
// tests/unit/services/exampleApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock global do $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock do useRuntimeConfig
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: { apiBaseUrl: 'https://api.test.com' }
  })
}))

import { useExampleApi } from '~/modules/_example/services/exampleApi'

describe('useExampleApi', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('getAll chama endpoint correto', async () => {
    mockFetch.mockResolvedValue([{ id: '1', name: 'Test' }])

    const api = useExampleApi()
    const result = await api.getAll()

    expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/examples')
    expect(result).toHaveLength(1)
  })

  it('create envia dados corretamente', async () => {
    mockFetch.mockResolvedValue({ id: '1', name: 'Novo' })

    const api = useExampleApi()
    await api.create({ name: 'Novo' })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/examples',
      expect.objectContaining({
        method: 'POST',
        body: { name: 'Novo' }
      })
    )
  })
})
```

### Mock de Composables

```typescript
// tests/unit/components/UserList.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserList from '~/components/UserList.vue'

// Mock do composable
vi.mock('~/composables/useUsers', () => ({
  useUsers: () => ({
    users: ref([
      { id: '1', name: 'João' },
      { id: '2', name: 'Maria' }
    ]),
    isLoading: ref(false),
    fetchUsers: vi.fn()
  })
}))

describe('UserList', () => {
  it('renderiza lista de usuários', () => {
    const wrapper = mount(UserList)

    expect(wrapper.text()).toContain('João')
    expect(wrapper.text()).toContain('Maria')
  })
})
```

### Mock de Módulos Externos

```typescript
// tests/unit/utils/date.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatRelativeDate } from '~/lib/date'

describe('formatRelativeDate', () => {
  beforeEach(() => {
    // Fixar data atual
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna "agora" para data atual', () => {
    const result = formatRelativeDate(new Date())
    expect(result).toBe('agora')
  })

  it('retorna "há 5 minutos" para 5 minutos atrás', () => {
    const fiveMinutesAgo = new Date('2024-01-15T09:55:00')
    const result = formatRelativeDate(fiveMinutesAgo)
    expect(result).toBe('há 5 minutos')
  })
})
```

---

## Testes E2E

### Com Playwright

```bash
npm install -D @playwright/test
```

```typescript
// tests/e2e/login.test.ts
import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test('usuário pode fazer login', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'teste@email.com')
    await page.fill('[data-testid="password"]', 'senha123')
    await page.click('[data-testid="submit"]')

    // Aguarda redirecionamento
    await page.waitForURL('/dashboard')

    // Verifica se está logado
    expect(page.url()).toContain('/dashboard')
    await expect(page.locator('[data-testid="user-name"]')).toContainText('teste@email.com')
  })

  test('mostra erro para credenciais inválidas', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'invalido@email.com')
    await page.fill('[data-testid="password"]', 'senhaerrada')
    await page.click('[data-testid="submit"]')

    await expect(page.locator('[data-testid="error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error"]')).toContainText('Credenciais inválidas')
  })
})
```

### Com Cypress

```bash
npm install -D cypress
```

```typescript
// cypress/e2e/login.cy.ts
describe('Login', () => {
  it('usuário pode fazer login', () => {
    cy.visit('/login')

    cy.get('[data-testid="email"]').type('teste@email.com')
    cy.get('[data-testid="password"]').type('senha123')
    cy.get('[data-testid="submit"]').click()

    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="user-name"]').should('contain', 'teste@email.com')
  })
})
```

---

## Boas Práticas

### 1. Nomenclatura de Testes

```typescript
// ✅ BOM - Descreve o comportamento
it('retorna erro quando email é inválido', () => {})
it('incrementa contador quando botão é clicado', () => {})
it('redireciona para login quando não autenticado', () => {})

// ❌ RUIM - Vago ou técnico demais
it('teste 1', () => {})
it('funciona', () => {})
it('validateEmail returns false', () => {})
```

### 2. Arrange-Act-Assert (AAA)

```typescript
it('adiciona item ao carrinho', () => {
  // Arrange - Preparar
  const cart = useCartStore()
  const product = { id: '1', name: 'Produto', price: 100 }

  // Act - Executar
  cart.addItem(product)

  // Assert - Verificar
  expect(cart.items).toContainEqual(product)
  expect(cart.total).toBe(100)
})
```

### 3. Um Assert por Conceito

```typescript
// ✅ BOM - Testes focados
it('adiciona item ao carrinho', () => {
  cart.addItem(product)
  expect(cart.items).toContainEqual(product)
})

it('atualiza total ao adicionar item', () => {
  cart.addItem(product)
  expect(cart.total).toBe(100)
})

// ❌ RUIM - Teste faz muita coisa
it('adiciona item, atualiza total, e envia analytics', () => {
  // ...muitos asserts
})
```

### 4. Data-testid para E2E

```vue
<!-- ✅ BOM - Seletor estável -->
<button data-testid="submit-button">Enviar</button>

<!-- ❌ RUIM - Seletor frágil -->
<button class="btn btn-primary mt-4">Enviar</button>
```

### 5. Factories para Dados de Teste

```typescript
// tests/factories/user.ts
export function createUser(overrides = {}) {
  return {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

// Uso no teste
it('exibe nome do usuário', () => {
  const user = createUser({ name: 'Maria' })
  // ...
})
```

### 6. Evitar Testes Frágeis

```typescript
// ❌ RUIM - Depende de implementação
expect(wrapper.vm.internalState).toBe(true)

// ✅ BOM - Testa comportamento observável
expect(wrapper.text()).toContain('Carregando...')
```

### 7. Cobertura de Código

```bash
# Rodar com cobertura
npm run test:coverage
```

Metas recomendadas:
- **Validators/Utils**: 100%
- **Composables**: 80%+
- **Stores**: 80%+
- **Componentes**: 70%+
- **API Routes**: 80%+

---

## Checklist de Testes

### Para cada Validator
- [ ] Dados válidos retornam `isValid: true`
- [ ] Cada campo obrigatório tem teste de ausência
- [ ] Cada regra de validação tem teste específico

### Para cada Composable
- [ ] Estado inicial correto
- [ ] Cada função altera estado esperado
- [ ] Casos de erro são tratados

### Para cada Store
- [ ] Estado inicial correto
- [ ] Actions alteram estado corretamente
- [ ] Getters retornam valores computados corretos

### Para cada API Route
- [ ] Retorno correto para requisição válida
- [ ] Erros de validação retornam 400
- [ ] Recurso não encontrado retorna 404
- [ ] Não autorizado retorna 401

### Para cada Componente Crítico
- [ ] Renderiza corretamente com props
- [ ] Eventos são emitidos corretamente
- [ ] Estados de loading/error são exibidos

---

## Referências

- [Nuxt Test Utils](https://nuxt.com/docs/getting-started/testing)
- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/docs/vue-testing-library/intro)
- [Playwright](https://playwright.dev/)
