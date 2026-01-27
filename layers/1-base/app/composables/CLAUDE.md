# Composables Globais - CLAUDE.md

Instruções para criar e usar composables reutilizáveis.

## Estrutura

```
app/composables/
├── useLoading.ts           # Estado de loading global
├── useNotification.ts      # Sistema de notificações
├── usePagination.ts        # Lógica de paginação
└── useDebounce.ts          # Debounce reativo
```

## Utils vs Composables

| Tipo | Pasta | Quando usar |
|------|-------|-------------|
| **Utils** | `app/lib/` | Funções puras, sem estado, sem Vue |
| **Composables** | `app/composables/` | Lógica com estado reativo (ref, computed) |

```typescript
// ❌ ERRADO - Isso é um util, não composable
export function useFormatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR')
}

// ✅ CORRETO - Util em app/lib/
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
// app/composables/useLoading.ts
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
// app/composables/usePagination.ts
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
// app/composables/useDebounce.ts
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
// app/composables/useToggle.ts
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
// app/composables/useField.ts
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
// app/composables/useGlobalLoading.ts

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
// app/composables/useWindowSize.ts
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
// app/composables/useAsyncState.ts
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

## Referências

- [Composables - Vue.js](https://vuejs.org/guide/reusability/composables.html)
- [Composables - Nuxt](https://nuxt.com/docs/4.x/directory-structure/app/composables)
- [VueUse](https://vueuse.org/) - Coleção de composables prontos
