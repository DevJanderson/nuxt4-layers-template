# Kubb + BFF - Padrão de Integração com APIs Externas

Este documento define o padrão oficial para integração com APIs externas no projeto, utilizando **Kubb** para geração de código e **BFF (Backend for Frontend)** para segurança.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Por que Kubb + BFF?](#por-que-kubb--bff)
3. [Arquitetura](#arquitetura)
4. [Configuração do Kubb](#configuração-do-kubb)
5. [Estrutura de Pastas](#estrutura-de-pastas)
6. [Implementação do BFF](#implementação-do-bff)
7. [Autenticação Segura](#autenticação-segura)
8. [Módulo Frontend](#módulo-frontend)
9. [Comandos](#comandos)
10. [Checklist de Implementação](#checklist-de-implementação)
11. [Exemplos Completos](#exemplos-completos)

---

## Visão Geral

### O que é Kubb?

**Kubb** é um gerador de código que transforma especificações OpenAPI/Swagger em código TypeScript:

```
OpenAPI Spec (JSON/YAML)  →  Kubb  →  Tipos + Schemas + Cliente HTTP
```

### O que é BFF?

**BFF (Backend for Frontend)** é um padrão onde o frontend não chama APIs externas diretamente. Em vez disso, chama seu próprio backend que faz a intermediação:

```
Browser  →  server/api/*  →  API Externa
            (seu Nitro)       (terceiros)
```

### Por que usar os dois juntos?

| Componente | Responsabilidade |
|------------|------------------|
| **Kubb** | Gera código type-safe para chamar APIs |
| **BFF** | Usa esse código no servidor de forma segura |

---

## Por que Kubb + BFF?

### Kubb Direto (NÃO RECOMENDADO para produção)

```
Browser  →  API Externa
```

**Problemas:**
- Token JWT exposto no browser (DevTools → Network)
- API Keys visíveis no código cliente
- Sem controle de rate limiting
- Não pode filtrar dados sensíveis

### Kubb + BFF (RECOMENDADO)

```
Browser  →  server/api/*  →  API Externa
```

**Benefícios:**
- Token em cookie httpOnly (invisível para JavaScript)
- API Keys ficam apenas no servidor
- Cache, logs, rate limiting no seu controle
- Pode transformar/filtrar dados antes de enviar ao cliente
- Pode combinar múltiplas APIs em uma resposta

### Tabela de Decisão

| Cenário | Abordagem |
|---------|-----------|
| API pública sem autenticação | Kubb direto (OK) |
| API com JWT/OAuth | **BFF obrigatório** |
| API com API Key/Secret | **BFF obrigatório** |
| Dados sensíveis (PII, financeiro) | **BFF obrigatório** |
| Precisa cache server-side | **BFF** |
| Precisa combinar APIs | **BFF** |
| Protótipo/teste rápido | Kubb direto (temporário) |

---

## Arquitetura

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│  app/modules/<modulo>/                                          │
│  ├── pages/           → UI (Vue components)                     │
│  └── presentation/                                              │
│      ├── stores/      → Pinia stores (chamam /api/*)            │
│      └── composables/ → Lógica reutilizável                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ $fetch('/api/<modulo>/*')
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVIDOR (Nitro BFF)                        │
├─────────────────────────────────────────────────────────────────┤
│  server/                                                        │
│  ├── api/<modulo>/    → Rotas BFF                               │
│  │   ├── auth/        → Login, logout, refresh                  │
│  │   └── <recurso>/   → CRUD via API externa                    │
│  └── utils/           → Helpers (token httpOnly)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │ fetch() com Bearer token
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CÓDIGO GERADO (Kubb)                          │
├─────────────────────────────────────────────────────────────────┤
│  app/generated/<api>/                                           │
│  ├── types/           → Interfaces TypeScript                   │
│  ├── zod/             → Schemas de validação                    │
│  └── client/          → Funções HTTP (usadas no server/)        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API EXTERNA                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Separação de Responsabilidades

| Camada | Localização | Responsabilidade |
|--------|-------------|------------------|
| **UI** | `app/modules/*/pages/` | Interface do usuário |
| **Estado** | `app/modules/*/presentation/stores/` | Gerencia estado, chama BFF |
| **BFF** | `server/api/*/` | Intermedia chamadas, gerencia tokens |
| **Gerado** | `app/generated/*/` | Tipos e cliente HTTP (usado pelo BFF) |
| **Externo** | API terceiros | Fonte de dados real |

---

## Configuração do Kubb

### 1. Instalar dependências

```bash
npm install -D @kubb/cli @kubb/core @kubb/plugin-oas @kubb/plugin-ts @kubb/plugin-zod @kubb/plugin-client
```

### 2. Criar arquivo `kubb.config.ts`

```typescript
import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { pluginClient } from '@kubb/plugin-client'

/**
 * Plugins compartilhados para todas as APIs
 */
function createPlugins() {
  return [
    pluginOas(),
    pluginTs({
      output: {
        path: './types',
        barrelType: 'named',
        extName: ''
      },
      group: {
        type: 'tag',
        name: ({ group }) => `${group}Types`
      },
      enumType: 'enum',
      dateType: 'string'
    }),
    pluginZod({
      output: {
        path: './zod',
        barrelType: 'named',
        extName: ''
      },
      group: {
        type: 'tag',
        name: ({ group }) => `${group}Schemas`
      },
      typed: true,
      dateType: 'string',
      inferred: true,
      importType: true
    }),
    pluginClient({
      output: {
        path: './client',
        barrelType: 'named',
        extName: ''
      },
      group: {
        type: 'tag',
        name: ({ group }) => `${group}Service`
      },
      client: 'fetch',
      dataReturnType: 'data',
      pathParamsType: 'object'
    })
  ]
}

export default defineConfig({
  name: 'minha-api',
  root: '.',
  input: {
    path: './openapi/minha-api.json'
  },
  output: {
    path: './app/generated/minha-api',
    clean: true,
    extension: {}
  },
  plugins: createPlugins()
})
```

### 3. Adicionar scripts ao `package.json`

```json
{
  "scripts": {
    "api:generate": "kubb",
    "api:watch": "kubb --watch"
  }
}
```

### 4. Adicionar ao `.gitignore`

```gitignore
# Kubb (cache interno)
**/.kubb/
```

---

## Estrutura de Pastas

### Visão Geral

```
projeto/
├── openapi/
│   └── minha-api.json           # Spec OpenAPI da API externa
│
├── app/
│   ├── generated/
│   │   └── minha-api/           # Código gerado pelo Kubb
│   │       ├── types/           # Interfaces TypeScript
│   │       ├── zod/             # Schemas Zod
│   │       └── client/          # Cliente HTTP
│   │
│   └── modules/
│       └── meu-modulo/          # Módulo DDD Lite
│           ├── nuxt.config.ts
│           ├── domain/
│           │   ├── types.ts     # Re-exporta tipos do Kubb
│           │   └── index.ts
│           ├── pages/
│           │   └── meu-modulo/
│           │       └── index.vue
│           └── presentation/
│               ├── stores/
│               │   └── auth.store.ts
│               └── composables/
│
├── server/
│   ├── api/
│   │   └── meu-modulo/          # Rotas BFF
│   │       ├── auth/
│   │       │   ├── login.post.ts
│   │       │   ├── logout.post.ts
│   │       │   ├── me.get.ts
│   │       │   └── refresh.post.ts
│   │       └── recursos/
│   │           ├── index.get.ts
│   │           └── [id].get.ts
│   └── utils/
│       └── minha-api.ts         # Helper para chamadas autenticadas
│
└── kubb.config.ts               # Configuração do Kubb
```

---

## Implementação do BFF

### 1. Criar utilitário de API (`server/utils/`)

```typescript
// server/utils/minha-api.ts

import type { H3Event } from 'h3'

const API_BASE_URL = 'https://api.exemplo.com'

/**
 * Faz requisição autenticada para a API externa
 */
export async function apiFetch<T>(
  event: H3Event,
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: any
  } = {}
): Promise<T> {
  const { method = 'GET', body } = options
  const token = getApiToken(event)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return await $fetch<T>(`${API_BASE_URL}${endpoint}`, {
    method,
    body,
    headers
  })
}

/**
 * Salva token em cookie httpOnly (SEGURO)
 */
export function setApiToken(event: H3Event, token: string, expiresIn = 3600) {
  setCookie(event, 'api_token', token, {
    httpOnly: true,                              // Não acessível via JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS em produção
    sameSite: 'strict',                          // Previne CSRF
    maxAge: expiresIn,
    path: '/'
  })
}

/**
 * Salva refresh token em cookie httpOnly
 */
export function setApiRefreshToken(event: H3Event, token: string) {
  setCookie(event, 'api_refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/'
  })
}

/**
 * Remove tokens (logout)
 */
export function clearApiTokens(event: H3Event) {
  deleteCookie(event, 'api_token')
  deleteCookie(event, 'api_refresh_token')
}

/**
 * Pega token do cookie
 */
export function getApiToken(event: H3Event): string | undefined {
  return getCookie(event, 'api_token')
}

/**
 * Pega refresh token do cookie
 */
export function getApiRefreshToken(event: H3Event): string | undefined {
  return getCookie(event, 'api_refresh_token')
}
```

### 2. Criar rotas de autenticação

#### Login (`server/api/<modulo>/auth/login.post.ts`)

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email e senha são obrigatórios'
    })
  }

  try {
    // Chama API externa
    const response = await $fetch<{
      access_token: string
      refresh_token?: string
    }>('https://api.exemplo.com/auth/login', {
      method: 'POST',
      body: { email: body.email, password: body.password }
    })

    // Salva tokens em cookies httpOnly (SEGURO!)
    setApiToken(event, response.access_token)
    if (response.refresh_token) {
      setApiRefreshToken(event, response.refresh_token)
    }

    // Busca dados do usuário
    const user = await $fetch<any>('https://api.exemplo.com/me', {
      headers: { Authorization: `Bearer ${response.access_token}` }
    })

    // Retorna apenas dados públicos do usuário
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 401,
      message: error.data?.message || 'Credenciais inválidas'
    })
  }
})
```

#### Me (`server/api/<modulo>/auth/me.get.ts`)

```typescript
export default defineEventHandler(async (event) => {
  const token = getApiToken(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    const user = await $fetch<any>('https://api.exemplo.com/me', {
      headers: { Authorization: `Bearer ${token}` }
    })

    return { user }
  } catch {
    clearApiTokens(event)
    throw createError({ statusCode: 401, message: 'Token inválido' })
  }
})
```

#### Logout (`server/api/<modulo>/auth/logout.post.ts`)

```typescript
export default defineEventHandler(async (event) => {
  clearApiTokens(event)
  return { success: true }
})
```

#### Refresh (`server/api/<modulo>/auth/refresh.post.ts`)

```typescript
export default defineEventHandler(async (event) => {
  const refreshToken = getApiRefreshToken(event)

  if (!refreshToken) {
    throw createError({ statusCode: 401, message: 'Sessão expirada' })
  }

  try {
    const response = await $fetch<{
      access_token: string
      refresh_token?: string
    }>('https://api.exemplo.com/auth/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` }
    })

    setApiToken(event, response.access_token)
    if (response.refresh_token) {
      setApiRefreshToken(event, response.refresh_token)
    }

    return { success: true }
  } catch {
    clearApiTokens(event)
    throw createError({ statusCode: 401, message: 'Sessão expirada' })
  }
})
```

### 3. Criar rotas de recursos

```typescript
// server/api/<modulo>/clientes/index.get.ts
export default defineEventHandler(async (event) => {
  const token = getApiToken(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  // Usa o helper que já adiciona o token
  const clientes = await apiFetch(event, '/clientes')

  return clientes
})
```

---

## Autenticação Segura

### Por que cookie httpOnly?

| Armazenamento | JavaScript acessa? | XSS pode roubar? |
|---------------|-------------------|------------------|
| localStorage | Sim | **SIM** |
| sessionStorage | Sim | **SIM** |
| Cookie normal | Sim | **SIM** |
| **Cookie httpOnly** | **NÃO** | **NÃO** |

### Fluxo de Autenticação

```
1. Usuário envia credenciais
   Browser  →  POST /api/auth/login  →  { email, password }

2. Servidor valida e salva token
   server/  →  API Externa  →  { access_token }
   server/  →  setCookie(httpOnly)  →  Cookie salvo no browser

3. Próximas requisições
   Browser  →  GET /api/clientes  →  Cookie enviado automaticamente
   server/  →  getCookie()  →  Token recuperado
   server/  →  API Externa  →  Bearer token

4. Logout
   Browser  →  POST /api/auth/logout
   server/  →  deleteCookie()  →  Cookie removido
```

---

## Módulo Frontend

### Store de Autenticação

```typescript
// app/modules/<modulo>/presentation/stores/auth.store.ts

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ user: any }>('/api/<modulo>/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      user.value = response.user
      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Erro ao fazer login'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await $fetch('/api/<modulo>/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
    }
  }

  async function checkAuth() {
    try {
      const response = await $fetch<{ user: any }>('/api/<modulo>/auth/me')
      user.value = response.user
      return true
    } catch {
      user.value = null
      return false
    }
  }

  return { user, isLoading, error, isAuthenticated, login, logout, checkAuth }
})
```

### Página de Login

```vue
<script setup lang="ts">
const email = ref('')
const password = ref('')
const auth = useAuthStore()

async function handleLogin() {
  const success = await auth.login(email.value, password.value)
  if (success) {
    navigateTo('/dashboard')
  }
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Senha" />
    <p v-if="auth.error" class="text-red-500">{{ auth.error }}</p>
    <button type="submit" :disabled="auth.isLoading">
      {{ auth.isLoading ? 'Entrando...' : 'Entrar' }}
    </button>
  </form>
</template>
```

---

## Comandos

```bash
# Gerar código do Kubb
npm run api:generate

# Gerar código em modo watch (desenvolvimento)
npm run api:watch

# Adicionar nova API:
# 1. Baixe o spec OpenAPI para openapi/
# 2. Configure em kubb.config.ts
# 3. Execute npm run api:generate
# 4. Crie as rotas BFF em server/api/
```

---

## Checklist de Implementação

### Nova API Externa

- [ ] Baixar spec OpenAPI para `openapi/<nome>-api.json`
- [ ] Configurar em `kubb.config.ts`
- [ ] Executar `npm run api:generate`
- [ ] Criar `server/utils/<nome>.ts` com helpers de token
- [ ] Criar rotas BFF em `server/api/<nome>/`
  - [ ] `auth/login.post.ts`
  - [ ] `auth/logout.post.ts`
  - [ ] `auth/me.get.ts`
  - [ ] `auth/refresh.post.ts`
- [ ] Criar módulo em `app/modules/<nome>/`
  - [ ] `nuxt.config.ts`
  - [ ] `domain/types.ts` (re-exporta tipos do Kubb)
  - [ ] `presentation/stores/auth.store.ts`
  - [ ] `pages/<nome>/index.vue`
- [ ] Adicionar módulo em `nuxt.config.ts` → `extends`
- [ ] Testar fluxo completo de login/logout

### Segurança

- [ ] Tokens em cookies httpOnly
- [ ] `secure: true` em produção
- [ ] `sameSite: 'strict'`
- [ ] Validação de input no servidor
- [ ] Tratamento de erros sem expor detalhes internos

---

## Exemplos Completos

### Estrutura de um módulo completo

```
app/modules/meu-modulo/
├── nuxt.config.ts
├── domain/
│   ├── types.ts          # Re-exporta tipos do Kubb
│   └── index.ts
├── pages/
│   └── meu-modulo/
│       ├── index.vue     # Página principal
│       └── login.vue     # Página de login
└── presentation/
    ├── stores/
    │   └── auth.store.ts
    └── composables/
        └── useAuth.ts

server/api/meu-modulo/
├── auth/
│   ├── login.post.ts
│   ├── logout.post.ts
│   ├── me.get.ts
│   └── refresh.post.ts
└── recursos/
    ├── index.get.ts
    ├── index.post.ts
    └── [id].get.ts

server/utils/
└── meu-modulo.ts
```

---

## Referências

- [Kubb Documentation](https://kubb.dev/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Nuxt Server Routes](https://nuxt.com/docs/guide/directory-structure/server)
- [H3 Event Handlers](https://h3.unjs.io/)
- [OWASP Authentication Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
