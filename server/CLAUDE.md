# Server - CLAUDE.md

Instruções específicas para o servidor Nitro (API routes).

## Estrutura

API global fica em `server/`. API específica de feature fica em `layers/*/server/`.

```
server/                         # API global
├── api/
│   └── health.get.ts           # GET /api/health
├── middleware/                 # Middleware do servidor
└── utils/                      # Utilitários do servidor

layers/2-example/server/        # API da feature layer
└── api/
    └── examples/
        ├── index.get.ts        # GET /api/examples
        └── [id].get.ts         # GET /api/examples/:id
```

## Convenção de Nomenclatura

O Nitro usa o nome do arquivo para definir o método HTTP:

| Arquivo | Método | Rota |
|---------|--------|------|
| `users.get.ts` | GET | `/api/users` |
| `users.post.ts` | POST | `/api/users` |
| `users/[id].get.ts` | GET | `/api/users/:id` |
| `users/[id].put.ts` | PUT | `/api/users/:id` |
| `users/[id].delete.ts` | DELETE | `/api/users/:id` |

## Criar Endpoint

### GET simples

```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  return [
    { id: '1', name: 'João' },
    { id: '2', name: 'Maria' }
  ]
})
```

### GET com parâmetro

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // Buscar usuário por id...
  return { id, name: 'João' }
})
```

### POST com body

```typescript
// server/api/users.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validar e criar usuário...
  return { id: '3', ...body }
})
```

### Com query params

```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10

  // Buscar com paginação...
  return { data: [], meta: { page, limit } }
})
```

## Tratamento de Erros

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const user = await findUser(id)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuário não encontrado'
    })
  }

  return user
})
```

## Validação com Zod

```typescript
// server/api/users.post.ts
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = createUserSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados inválidos',
      data: result.error.flatten()
    })
  }

  // Criar usuário com result.data...
  return { id: '1', ...result.data }
})
```

## Middleware do Servidor

```typescript
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  const token = getHeader(event, 'authorization')

  // Rotas públicas
  if (event.path.startsWith('/api/public')) {
    return
  }

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token não fornecido'
    })
  }

  // Validar token e adicionar ao contexto
  event.context.user = { id: '1', name: 'João' }
})
```

## Utilitários Disponíveis

| Função | Uso |
|--------|-----|
| `defineEventHandler` | Define o handler do endpoint |
| `readBody(event)` | Lê o body da requisição |
| `getQuery(event)` | Obtém query params |
| `getRouterParam(event, 'id')` | Obtém parâmetro da rota |
| `getHeader(event, 'name')` | Obtém header específico |
| `setResponseStatus(event, 201)` | Define status code |
| `createError({ statusCode, message })` | Cria erro HTTP |

## Acessar Runtime Config

```typescript
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  // config.jwtSecret (privado - só no servidor)
  // config.public.apiBaseUrl (público)
})
```

---

## Segurança Server-Side


### Regra de Ouro

> **NUNCA confie em dados do cliente. Sempre valide no servidor.**

### 1. Validação Obrigatória

```typescript
// server/api/users.post.ts
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(3).max(100).trim(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // SEMPRE validar
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.flatten()
    })
  }

  // Usar result.data (dados seguros)
})
```

### 2. IDOR - Verificar Ownership

```typescript
// server/api/orders/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const userId = event.context.user?.id

  if (!userId) {
    throw createError({ statusCode: 401 })
  }

  const order = await db.orders.findFirst({
    where: {
      id,
      userId // ← CRÍTICO: Só retorna se pertence ao usuário
    }
  })

  if (!order) {
    throw createError({ statusCode: 404 })
  }

  return order
})
```

### 3. Rate Limiting

```typescript
// server/utils/rateLimit.ts
const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = store.get(ip)

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

// Uso em endpoint
export default defineEventHandler((event) => {
  const ip = getRequestIP(event) || 'unknown'

  if (!rateLimit(ip, 5, 60000)) { // 5 requisições por minuto
    throw createError({ statusCode: 429, message: 'Muitas requisições' })
  }

  // Processar...
})
```

### 4. Cookies Seguros

```typescript
// server/api/auth/login.post.ts
setCookie(event, 'auth_token', token, {
  httpOnly: true,      // Não acessível via JavaScript
  secure: true,        // Apenas HTTPS
  sameSite: 'strict',  // Proteção CSRF
  maxAge: 60 * 60 * 24,
  path: '/'
})
```

### 5. Path Traversal

```typescript
// server/api/files/[...path].get.ts
import { resolve } from 'path'

export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path')

  // Validar path
  if (!path || path.includes('..')) {
    throw createError({ statusCode: 400, message: 'Path inválido' })
  }

  // Verificar se está dentro do diretório permitido
  const basePath = '/app/uploads'
  const fullPath = resolve(basePath, path)

  if (!fullPath.startsWith(basePath)) {
    throw createError({ statusCode: 403, message: 'Acesso negado' })
  }

  // Agora é seguro acessar
})
```

### 6. Sanitização de Saída

```typescript
// server/api/comments.post.ts
import DOMPurify from 'isomorphic-dompurify'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Sanitizar HTML antes de salvar
  const safeContent = DOMPurify.sanitize(body.content, {
    ALLOWED_TAGS: ['b', 'i', 'p', 'br'],
    ALLOWED_ATTR: []
  })

  // Salvar safeContent no banco
})
```

### 7. SQL Injection (Prisma/ORM)

```typescript
// ❌ VULNERÁVEL - String concatenada
const users = await db.$queryRaw`SELECT * FROM users WHERE name = '${name}'`

// ✅ SEGURO - Prepared statement
const users = await db.user.findMany({
  where: { name }
})

// ✅ SEGURO - Query raw com parâmetros
const users = await db.$queryRaw`SELECT * FROM users WHERE name = ${name}`
```

### 8. Deserialização Segura

```typescript
// server/utils/safeParse.ts
import { z } from 'zod'

export function safeParse<T>(input: string, schema: z.ZodType<T>): T | null {
  try {
    const parsed = JSON.parse(input, (key, value) => {
      // Bloquear prototype pollution
      if (key === '__proto__' || key === 'constructor') {
        return undefined
      }
      return value
    })
    const result = schema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
```

### 9. Secrets no Servidor

```typescript
// ✅ CORRETO - Secrets só no servidor
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  // config.jwtSecret - Disponível apenas aqui
  // config.dbUrl - Disponível apenas aqui

  // ❌ NUNCA retornar secrets
  return { secret: config.jwtSecret } // ERRADO!
})
```

### Checklist Server-Side

- [ ] Validação Zod em todos os endpoints
- [ ] Verificação de ownership (IDOR)
- [ ] Rate limiting em login e endpoints sensíveis
- [ ] Cookies httpOnly para tokens
- [ ] Sanitização de paths
- [ ] Prepared statements para queries
- [ ] Secrets apenas em `runtimeConfig` (não `public`)
- [ ] Sanitização de HTML do usuário

---

## Testando API Routes

### Teste de Integração

```typescript
// tests/integration/api/users.test.ts
import { describe, it, expect } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('API /api/users', async () => {
  await setup({ server: true })

  it('GET /api/users should return array', async () => {
    const users = await $fetch('/api/users')
    expect(Array.isArray(users)).toBe(true)
  })

  it('POST /api/users should create user', async () => {
    const user = await $fetch('/api/users', {
      method: 'POST',
      body: { name: 'Test', email: 'test@example.com' }
    })
    expect(user).toHaveProperty('id')
  })

  it('POST /api/users should return 400 for invalid data', async () => {
    try {
      await $fetch('/api/users', {
        method: 'POST',
        body: { name: '' }
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
  it('should return ok status', async () => {
    const mockEvent = {
      context: {},
      node: { req: {}, res: {} }
    } as any

    const result = await handler(mockEvent)
    expect(result).toEqual({ status: 'ok' })
  })
})
```

### Teste E2E de API

```typescript
// tests/e2e/api.spec.ts
import { test, expect } from '@playwright/test'

test.describe('API E2E', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.status).toBe('ok')
  })
})
```

## Referências

- [Server Routes - Nuxt](https://nuxt.com/docs/guide/directory-structure/server)
- [Nitro Documentation](https://nitro.unjs.io/)
- [Nuxt Testing](https://nuxt.com/docs/getting-started/testing)
