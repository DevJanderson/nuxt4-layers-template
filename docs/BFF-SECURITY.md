# Padrões de Segurança BFF

Padrões concretos para o Backend For Frontend (BFF) com Nuxt 4.

## 1. Error Sanitization

Nunca repassar detalhes da API externa ao client — pode conter SQL, stack traces ou dados sensíveis.

```typescript
// ❌ NUNCA repassar err.data?.detail
throw createError({
  statusCode: err.statusCode || 500,
  message: err.data?.detail // PERIGO: pode vazar SQL, stack traces
})

// ✅ Usar mensagens genéricas estáticas
throw createError({
  statusCode: err.statusCode || 500,
  message: 'Erro ao processar requisição'
})
```

## 2. Timeout em Chamadas Externas

Sempre usar timeout para evitar que uma API externa trave o BFF inteiro.

```typescript
const data = await $fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
  signal: AbortSignal.timeout(15_000) // 15 segundos
})
```

O helper `authFetch` em `layers/2-auth/server/utils/auth-api.ts` já implementa esse padrão.

## 3. SSR Cookie Forwarding

Composables que chamam o BFF precisam encaminhar cookies durante SSR, caso contrário o servidor Nuxt não envia os cookies do browser na requisição interna.

```typescript
export function useFeatureApi() {
  const headers = useRequestHeaders(['cookie'])

  async function getAll() {
    return $fetch('/api/feature', { headers })
  }
  return { getAll }
}
```

## 4. Trailing Slash em Endpoints de Listagem

Algumas APIs externas fazem redirect 301/307 quando a URL não tem trailing slash. O redirect **perde o header Authorization**, causando 403.

```typescript
// ✅ Correto — com trailing slash
authFetch(event, '/api/v1/usuarios/')

// ❌ Errado — redirect 307 → perde Authorization → 403
authFetch(event, '/api/v1/usuarios')
```

## 5. Query Params com Zod

Validar query params com Zod `.strict()` para rejeitar parâmetros desconhecidos.

```typescript
import { z } from 'zod'

const querySchema = z
  .object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
  .strict()

export default defineEventHandler(event => {
  const result = querySchema.safeParse(getQuery(event))
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: 'Parâmetros inválidos' })
  }
  // result.data está tipado e validado
})
```

## 6. Paginação Cursor

Padrão de tipos para paginação baseada em cursor (mais eficiente que offset para grandes datasets).

```typescript
// Tipo da resposta paginada
interface PaginatedResponse<T> {
  results: T[]
  has_next: boolean
  next_cursor: string
  has_previous: boolean
  previous_cursor: string
}

// No store
const items = ref<Item[]>([])
const pagination = ref<Omit<PaginatedResponse<never>, 'results'> | null>(null)

async function fetchPage(cursor?: string) {
  const params = new URLSearchParams()
  if (cursor) params.set('cursor', cursor)

  const response = await api.getAll(params.toString())
  items.value = response.results
  const { results: _, ...meta } = response
  pagination.value = meta
}
```

## Referências

- `layers/2-auth/server/utils/auth-api.ts` — implementação do authFetch
- `layers/2-auth/CLAUDE.md` — documentação da layer de auth
