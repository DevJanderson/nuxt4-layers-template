# Composables Globais - CLAUDE.md

Instruções para criar e usar composables reutilizáveis.

## Estrutura

```
layers/1-base/app/composables/
├── useLoading.ts           # Estado de loading global
├── useNotification.ts      # Sistema de notificações
├── usePagination.ts        # Lógica de paginação
└── useDebounce.ts          # Debounce reativo
```

## Utils vs Composables

| Tipo | Pasta | Quando usar |
|------|-------|-------------|
| **Utils** | `layers/1-base/app/utils/` | Funções puras, sem estado, sem Vue |
| **Composables** | `layers/1-base/app/composables/` | Lógica com estado reativo (ref, computed) |

```typescript
// ❌ ERRADO - Isso é um util, não composable
export function useFormatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR')
}

// ✅ CORRETO - Util em layers/1-base/app/utils/
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR')
}

// ✅ CORRETO - Composable com estado reativo
export function useDateFormatter() {
  const locale = ref('pt-BR')

  const format = (date: string) => {
    return new Date(date).toLocaleDateString(locale.value)
  }

  return { locale, format }
}
```

---

## Padrões de Composables

### 1. Loading State

```typescript
// layers/1-base/app/composables/useLoading.ts
export function useLoading() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function withLoading<T>(fn: () => Promise<T>): Promise<T | null> {
    isLoading.value = true
    error.value = null

    try {
      return await fn()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro desconhecido'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, withLoading }
}
```

**Uso:**
```typescript
const { isLoading, error, withLoading } = useLoading()

async function fetchData() {
  const data = await withLoading(() => $fetch('/api/users'))
  if (data) {
    users.value = data
  }
}
```

### 2. Pagination

```typescript
// layers/1-base/app/composables/usePagination.ts
interface PaginationOptions {
  initialPage?: number
  initialPerPage?: number
}

export function usePagination(options: PaginationOptions = {}) {
  const page = ref(options.initialPage ?? 1)
  const perPage = ref(options.initialPerPage ?? 10)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / perPage.value))
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)

  function nextPage() {
    if (hasNextPage.value) page.value++
  }

  function prevPage() {
    if (hasPrevPage.value) page.value--
  }

  function goToPage(p: number) {
    if (p >= 1 && p <= totalPages.value) {
      page.value = p
    }
  }

  function setTotal(t: number) {
    total.value = t
  }

  return {
    page,
    perPage,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    setTotal
  }
}
```

**Uso:**
```typescript
const { page, perPage, totalPages, nextPage, setTotal } = usePagination()

const { data } = await useFetch('/api/users', {
  query: { page, limit: perPage }
})

// Atualizar total quando receber resposta
watch(data, (newData) => {
  if (newData?.meta) {
    setTotal(newData.meta.total)
  }
})
```

### 3. Debounce

```typescript
// layers/1-base/app/composables/useDebounce.ts
export function useDebounce<T>(value: Ref<T>, delay = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: NodeJS.Timeout

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}
```

**Uso:**
```typescript
const search = ref('')
const debouncedSearch = useDebounce(search, 500)

// Busca só dispara após 500ms sem digitação
watch(debouncedSearch, (term) => {
  fetchResults(term)
})
```

### 4. Toggle

```typescript
// layers/1-base/app/composables/useToggle.ts
export function useToggle(initialValue = false) {
  const state = ref(initialValue)

  function toggle() {
    state.value = !state.value
  }

  function setTrue() {
    state.value = true
  }

  function setFalse() {
    state.value = false
  }

  return { state, toggle, setTrue, setFalse }
}
```

**Uso:**
```typescript
const { state: isOpen, toggle, setFalse: close } = useToggle()
```

### 5. Form Field

```typescript
// layers/1-base/app/composables/useField.ts
interface FieldOptions<T> {
  initialValue: T
  validate?: (value: T) => string | null
}

export function useField<T>(options: FieldOptions<T>) {
  const value = ref(options.initialValue) as Ref<T>
  const error = ref<string | null>(null)
  const touched = ref(false)

  const isValid = computed(() => !error.value)

  function validate(): boolean {
    if (options.validate) {
      error.value = options.validate(value.value)
    }
    return isValid.value
  }

  function reset() {
    value.value = options.initialValue
    error.value = null
    touched.value = false
  }

  function touch() {
    touched.value = true
    validate()
  }

  // Validar quando valor mudar (após touched)
  watch(value, () => {
    if (touched.value) validate()
  })

  return { value, error, touched, isValid, validate, reset, touch }
}
```

**Uso:**
```typescript
const email = useField({
  initialValue: '',
  validate: (v) => {
    if (!v) return 'Email obrigatório'
    if (!v.includes('@')) return 'Email inválido'
    return null
  }
})

// No template
<Input v-model="email.value" @blur="email.touch" />
<span v-if="email.error">{{ email.error }}</span>
```

---

## Singleton State (Estado Global)

Quando precisar de estado compartilhado entre componentes **sem Pinia**:

```typescript
// layers/1-base/app/composables/useGlobalLoading.ts

// Estado FORA da função = compartilhado (singleton)
const isLoading = ref(false)
const loadingCount = ref(0)

export function useGlobalLoading() {
  function start() {
    loadingCount.value++
    isLoading.value = true
  }

  function stop() {
    loadingCount.value = Math.max(0, loadingCount.value - 1)
    if (loadingCount.value === 0) {
      isLoading.value = false
    }
  }

  return { isLoading: readonly(isLoading), start, stop }
}
```

**Diferença:**
```typescript
// Estado LOCAL - cada componente tem seu próprio estado
export function useCounter() {
  const count = ref(0) // Dentro da função
  return { count }
}

// Estado GLOBAL - todos compartilham o mesmo estado
const count = ref(0) // Fora da função
export function useGlobalCounter() {
  return { count }
}
```

---

## Composables com Lifecycle

```typescript
// layers/1-base/app/composables/useWindowSize.ts
export function useWindowSize() {
  const width = ref(0)
  const height = ref(0)

  function update() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  // Lifecycle hooks funcionam em composables!
  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { width, height }
}
```

---

## Composables com Async

```typescript
// layers/1-base/app/composables/useAsyncState.ts
interface UseAsyncStateOptions<T> {
  immediate?: boolean
  initialValue?: T
}

export function useAsyncState<T>(
  fn: () => Promise<T>,
  options: UseAsyncStateOptions<T> = {}
) {
  const { immediate = true, initialValue = null } = options

  const data = ref<T | null>(initialValue) as Ref<T | null>
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const isReady = ref(false)

  async function execute() {
    isLoading.value = true
    error.value = null

    try {
      data.value = await fn()
      isReady.value = true
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      isLoading.value = false
    }
  }

  if (immediate) {
    execute()
  }

  return { data, isLoading, error, isReady, execute }
}
```

**Uso:**
```typescript
const { data: users, isLoading, execute: refresh } = useAsyncState(
  () => $fetch<User[]>('/api/users')
)
```

---

## Identificar Código Duplicado

### Sinais de que precisa de um composable:

1. **Mesmo useState em vários componentes**
```typescript
// Se você vê isso repetido...
const isLoading = ref(false)
const error = ref<string | null>(null)

// Extraia para useLoading()
```

2. **Mesma lógica de watch**
```typescript
// Se você vê isso repetido...
watch(search, debounce(() => fetchResults(), 300))

// Extraia para useDebounce()
```

3. **Mesmo padrão try/catch**
```typescript
// Se você vê isso repetido...
try {
  isLoading.value = true
  data.value = await fetch()
} catch (e) {
  error.value = e.message
} finally {
  isLoading.value = false
}

// Extraia para useLoading().withLoading()
```

4. **Mesma lógica de formulário**
```typescript
// Se você vê validação repetida...
// Extraia para useField() ou useForm()
```

---

## Convenções

| Item | Convenção |
|------|-----------|
| Nome do arquivo | `use{Nome}.ts` |
| Nome da função | `use{Nome}` |
| Retorno | Objeto com refs e funções |
| Estado local | `ref()` dentro da função |
| Estado global | `ref()` fora da função |

---

## Testando Composables

### Teste Básico

```typescript
// tests/unit/composables/useToggle.test.ts
import { describe, it, expect } from 'vitest'
import { useToggle } from '~/layers/1-base/app/composables/useToggle'

describe('useToggle', () => {
  it('should start with initial value', () => {
    const { state } = useToggle(false)
    expect(state.value).toBe(false)
  })

  it('should toggle state', () => {
    const { state, toggle } = useToggle(false)
    toggle()
    expect(state.value).toBe(true)
    toggle()
    expect(state.value).toBe(false)
  })

  it('should set true/false explicitly', () => {
    const { state, setTrue, setFalse } = useToggle(false)
    setTrue()
    expect(state.value).toBe(true)
    setFalse()
    expect(state.value).toBe(false)
  })
})
```

### Teste com Debounce

```typescript
// tests/unit/composables/useDebounce.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useDebounce } from '~/layers/1-base/app/composables/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const source = ref('initial')
    const debounced = useDebounce(source, 300)
    expect(debounced.value).toBe('initial')
  })

  it('should debounce value changes', async () => {
    const source = ref('initial')
    const debounced = useDebounce(source, 300)

    source.value = 'updated'
    await nextTick()
    expect(debounced.value).toBe('initial')

    vi.advanceTimersByTime(300)
    await nextTick()
    expect(debounced.value).toBe('updated')
  })
})
```

### Teste de Composable com Loading

```typescript
// tests/unit/composables/useLoading.test.ts
import { describe, it, expect } from 'vitest'
import { useLoading } from '~/layers/1-base/app/composables/useLoading'

describe('useLoading', () => {
  it('should start not loading', () => {
    const { isLoading } = useLoading()
    expect(isLoading.value).toBe(false)
  })

  it('should set loading during async operation', async () => {
    const { isLoading, withLoading } = useLoading()

    const promise = withLoading(async () => {
      await new Promise((r) => setTimeout(r, 10))
      return 'result'
    })

    expect(isLoading.value).toBe(true)
    const result = await promise
    expect(isLoading.value).toBe(false)
    expect(result).toBe('result')
  })

  it('should capture errors', async () => {
    const { error, withLoading } = useLoading()

    await withLoading(async () => {
      throw new Error('Test error')
    })

    expect(error.value).toBe('Test error')
  })
})
```

### Teste de Composable com Pinia

```typescript
// tests/unit/composables/useExampleStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExampleStore } from '~/layers/2-example/app/composables/useExampleStore'

// Mock do API
vi.mock('~/layers/2-example/app/composables/useExampleApi', () => ({
  useExampleApi: () => ({
    getAll: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }])
  })
}))

describe('useExampleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should start empty', () => {
    const store = useExampleStore()
    expect(store.items).toEqual([])
  })

  it('should fetch items', async () => {
    const store = useExampleStore()
    await store.fetchAll()
    expect(store.items).toHaveLength(1)
  })
})
```

## Referências

- [Composables - Vue.js](https://vuejs.org/guide/reusability/composables.html)
- [Composables - Nuxt](https://nuxt.com/docs/4.x/directory-structure/app/composables)
- [VueUse](https://vueuse.org/) - Coleção de composables prontos
- [Vitest](https://vitest.dev/) - Framework de testes
