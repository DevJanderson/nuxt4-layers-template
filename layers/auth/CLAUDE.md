# Layer auth - CLAUDE.md

Layer de autenticação BFF (Backend For Frontend) com cookies httpOnly.

## Estrutura

```
layers/auth/
├── nuxt.config.ts
├── app/
│   ├── composables/
│   │   ├── types.ts              # User, AuthResponse, LoginRequest
│   │   ├── useAuthApi.ts         # Service ($fetch → /api/auth/*)
│   │   └── useAuthStore.ts       # Pinia store (user, isAuthenticated)
│   ├── middleware/
│   │   ├── auth.ts               # Protege rotas autenticadas
│   │   └── guest.ts              # Redireciona se já logado
│   └── pages/
│       ├── login.vue
│       └── forgot-password.vue
└── server/
    ├── api/auth/
    │   ├── login.post.ts
    │   ├── logout.post.ts
    │   ├── me.get.ts
    │   └── refresh.post.ts
    └── utils/
        └── auth-api.ts           # getAccessToken, setTokenCookies, authFetch
```

## Padrões de Segurança BFF

1. **Cookies httpOnly** — tokens nunca ficam em localStorage
2. **authFetch** — helper com guard de auth (rejeita sem token → 401)
3. **Timeout 15s** — `AbortSignal.timeout(15_000)` em chamadas externas
4. **Error sanitization** — nunca repassar `err.data?.detail` da API externa
5. **SSR cookie forwarding** — `useRequestHeaders(['cookie'])` no useAuthApi
6. **Zod validation** — em todo endpoint POST/PUT

## Uso

### Proteger páginas

```typescript
// Exige autenticação
definePageMeta({ middleware: 'auth' })

// Redireciona se já logado (ex: página de login)
definePageMeta({ middleware: 'guest' })
```

### Store

```typescript
const auth = useAuthStore()
await auth.login({ email, password })
auth.isAuthenticated // computed boolean
auth.user // User | null
await auth.logout()
```

## TODO

Os endpoints estão com mock. Para integrar com API real:

1. Configurar `NUXT_API_EXTERNAL_BASE_URL` no `.env`
2. Substituir mocks em `server/api/auth/*.ts` por chamadas via `authFetch()`
