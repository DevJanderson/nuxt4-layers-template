# Nuxt 4 Layers - Guia de Implementação

Guia completo para implementar arquitetura modular com Nuxt Layers seguindo os padrões oficiais da comunidade.

---

## Sumário

1. [O que são Layers?](#o-que-são-layers)
2. [Estrutura Final do Projeto](#estrutura-final-do-projeto)
3. [Regras de Organização](#regras-de-organização)
4. [Passo a Passo de Implementação](#passo-a-passo-de-implementação)
5. [Configurações Necessárias](#configurações-necessárias)
6. [Tailwind CSS v4 com Layers](#tailwind-css-v4-com-layers)
7. [shadcn-vue com Layers](#shadcn-vue-com-layers)
8. [Referências Oficiais](#referências-oficiais)

---

## O que são Layers?

Layers são módulos independentes que permitem:
- Separação de responsabilidades (auth, dashboard, landing, etc.)
- Reutilização de código entre projetos
- Ordem de prioridade configurável via prefixos numéricos

> **IMPORTANTE:** Use hífen (`-`) e não ponto (`.`) no nome das pastas de layers. O ponto causa problemas na resolução de módulos do Nuxt. Exemplo: use `1-base` em vez de `1.base`.

---

## Estrutura Final do Projeto

### Visão Geral

```
projeto/
├── app/                            # APENAS arquivos essenciais
│   ├── app.vue                     # Root component
│   ├── error.vue                   # Página de erro global
│   ├── app.config.ts
│   └── assets/
│       └── css/main.css
│
├── layers/                         # TODAS as features modulares
│   ├── 1-base/                     # Shared Layer (fundação)
│   ├── 2-auth/                     # Feature: Autenticação
│   ├── 3-dashboard/                # Feature: Dashboard
│   └── 4-landing/                  # Feature: Landing Page
│
├── public/
├── nuxt.config.ts
├── package.json
└── tsconfig.json
```

### Estrutura da Shared Layer (1-base)

```
layers/1-base/
├── nuxt.config.ts                  # Configuração + alias
├── app/
│   ├── components/                 # Componentes compartilhados
│   │   ├── ui/                     # shadcn-vue components
│   │   │   └── button/
│   │   └── common/                 # Componentes globais
│   │       ├── Header.vue
│   │       └── Footer.vue
│   ├── composables/                # Composables compartilhados
│   │   └── useApi.ts
│   ├── layouts/                    # Layout padrão global
│   │   └── default.vue
│   └── utils/                      # Funções utilitárias
│       └── utils.ts
└── shared/                         # Tipos e constantes (via alias)
    ├── types/
    │   ├── index.ts
    │   └── api.ts
    └── constants/
        └── index.ts
```

### Estrutura de uma Feature Layer

```
layers/2-auth/
├── nuxt.config.ts                  # Obrigatório
├── app/                            # Código da aplicação
│   ├── components/
│   │   └── AuthLoginForm.vue
│   ├── composables/
│   │   └── useAuth.ts
│   ├── layouts/
│   │   └── auth.vue
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── guest.ts
│   └── pages/
│       └── auth/
│           ├── login.vue
│           └── register.vue
└── server/                         # API routes (na raiz, NÃO em app/)
    └── api/
        └── auth/
            ├── login.post.ts
            └── me.get.ts
```

---

## Regras de Organização

### O que vai em `app/` (raiz do projeto)

| Arquivo | Descrição |
|---------|-----------|
| `app.vue` | Componente raiz da aplicação |
| `error.vue` | Página de erro global (404, 500) |
| `app.config.ts` | Configuração runtime da app |
| `assets/` | CSS global, fontes, imagens globais |

**IMPORTANTE:** NÃO coloque em `app/` (raiz):
- ❌ `components/`
- ❌ `composables/`
- ❌ `layouts/` (vai em `1-base`)
- ❌ `pages/`
- ❌ `middleware/`

### O que vai em `layers/1-base/`

| Diretório | Conteúdo | Auto-import |
|-----------|----------|-------------|
| `app/components/ui/` | Componentes shadcn-vue (Button, Card, etc.) | Sim |
| `app/components/common/` | Componentes globais (Header, Footer) | Sim |
| `app/composables/` | Composables globais (useApi, useNotification) | Sim |
| `app/layouts/` | Layout padrão (default.vue) | Sim |
| `app/utils/` | Funções utilitárias (formatDate, formatCurrency) | Sim |
| `shared/types/` | Interfaces TypeScript (User, ApiResponse) | Não (via alias) |
| `shared/constants/` | Constantes globais (ROLES, APP_CONFIG) | Não (via alias) |

### O que vai em Feature Layers (2-auth, 3-dashboard, etc.)

| Diretório | Conteúdo |
|-----------|----------|
| `app/components/` | Componentes específicos da feature |
| `app/composables/` | Composables específicos da feature |
| `app/layouts/` | Layouts específicos da feature |
| `app/middleware/` | Middleware específico da feature |
| `app/pages/` | Páginas da feature |
| `server/` | API routes da feature (NA RAIZ, não em app/) |

### Convenção de Nomenclatura

#### Prefixos Numéricos nas Layers

```
layers/
├── 1-base/       # Prioridade 1 (menor) - carrega primeiro
├── 2-auth/       # Prioridade 2
├── 3-dashboard/  # Prioridade 3
└── 4-landing/    # Prioridade 4 (maior) - sobrescreve anteriores
```

**Regra:** Número MAIOR = MAIOR prioridade = sobrescreve layers anteriores.

#### Prefixos em Componentes

Sempre prefixe componentes com o nome da layer:

```
layers/2-auth/app/components/
├── AuthLoginForm.vue       ✓ Prefixo "Auth"
├── AuthRegisterForm.vue    ✓
└── AuthForgotPassword.vue  ✓

layers/3-dashboard/app/components/
├── DashboardSidebar.vue    ✓ Prefixo "Dashboard"
├── DashboardHeader.vue     ✓
└── DashboardStatCard.vue   ✓
```

---

## Passo a Passo de Implementação

### Passo 1: Criar estrutura de diretórios

```bash
mkdir -p layers/1-base/{app/{components/{ui,common},composables,layouts,utils},shared/{types,constants}}
mkdir -p layers/2-auth/{app/{components,composables,layouts,middleware,pages},server/api}
mkdir -p layers/3-dashboard/{app/{components,composables,layouts,pages},server/api}
mkdir -p layers/4-landing/{app/{components,composables,layouts,pages}}
```

### Passo 2: Mover arquivos existentes

#### De `app/` para `layers/1-base/app/`
```bash
# Layout padrão
mv app/layouts/default.vue layers/1-base/app/layouts/

# Componentes compartilhados
mv app/components/ui/* layers/1-base/app/components/ui/

# Composables globais
mv app/composables/useApi.ts layers/1-base/app/composables/
```

#### De `app/` para Feature Layers
```bash
# Páginas de auth
mv app/pages/auth/* layers/2-auth/app/pages/auth/

# Layouts específicos
mv app/layouts/auth.vue layers/2-auth/app/layouts/
mv app/layouts/dashboard.vue layers/3-dashboard/app/layouts/

# Middleware
mv app/middleware/auth.ts layers/2-auth/app/middleware/
mv app/middleware/guest.ts layers/2-auth/app/middleware/
```

#### De `server/` para Feature Layers
```bash
# API de auth
mv server/api/auth/* layers/2-auth/server/api/auth/
```

#### De `shared/` para `layers/1-base/shared/`
```bash
mv shared/* layers/1-base/shared/
```

### Passo 3: Limpar diretórios vazios

```bash
# Remover pastas vazias que sobraram
rmdir app/components/layout app/components 2>/dev/null
rmdir app/composables 2>/dev/null
rmdir app/pages/auth app/pages 2>/dev/null
rmdir app/middleware 2>/dev/null
rmdir server/api/auth server/api server 2>/dev/null
rmdir shared/types shared/constants shared 2>/dev/null
```

### Passo 4: Verificar estrutura final de `app/`

Após a migração, `app/` deve conter APENAS:

```
app/
├── app.vue
├── error.vue
├── app.config.ts
└── assets/
    └── css/main.css
```

**Nota:** `layouts/default.vue` vai em `layers/1-base/app/layouts/`

---

## Configurações Necessárias

### nuxt.config.ts (raiz do projeto)

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Layers em ~/layers são AUTO-REGISTRADAS (Nuxt v3.12+)
  // NÃO precisa declarar em extends
  // Ordem de prioridade: 4-landing > 3-dashboard > 2-auth > 1-base

  modules: [
    // seus módulos
  ],

  css: ['~/assets/css/main.css']
})
```

**IMPORTANTE:** NÃO use `extends` para layers locais. O Nuxt auto-registra automaticamente.

### layers/1-base/nuxt.config.ts

```ts
export default defineNuxtConfig({
  alias: {
    '#shared': '../layers/1-base/shared'
  }
})
```

### layers/2-auth/nuxt.config.ts

```ts
export default defineNuxtConfig({
  // Configurações específicas da layer de auth
})
```

### layers/3-dashboard/nuxt.config.ts

```ts
export default defineNuxtConfig({
  // Configurações específicas da layer de dashboard
})
```

### layers/4-landing/nuxt.config.ts

```ts
export default defineNuxtConfig({
  // Configurações específicas da layer de landing
})
```

---

## Imports e Uso

### Componentes e Composables (auto-importados)

```vue
<script setup>
// Composables são auto-importados - não precisa import
const { user, login, logout } = useAuth()
const { data } = useApi('/api/users')
</script>

<template>
  <!-- Componentes são auto-importados -->
  <LayoutHeader />
  <AuthLoginForm />
  <LayoutFooter />
</template>
```

### Tipos e Constantes (via alias)

```ts
// Em qualquer arquivo do projeto
import type { User, LoginCredentials } from '#shared/types'
import { ROLES, APP_CONFIG } from '#shared/constants'
```

---

## Checklist de Verificação

### Estrutura

- [ ] `app/` contém apenas: `app.vue`, `error.vue`, `app.config.ts`, `assets/`
- [ ] Não existe `app/layouts/` (movido para `layers/1-base/`)
- [ ] Não existe `app/components/`
- [ ] Não existe `app/composables/`
- [ ] Não existe `app/pages/`
- [ ] Não existe `app/middleware/`
- [ ] Não existe `server/` na raiz (movido para layers)
- [ ] Não existe `shared/` na raiz (movido para `layers/1-base/`)

### Layers

- [ ] Cada layer tem `nuxt.config.ts`
- [ ] Código de aplicação está em `layer/app/`
- [ ] Código de servidor está em `layer/server/` (na raiz da layer)
- [ ] Componentes têm prefixo do nome da layer

### Testes

```bash
# Verificar se o servidor inicia
npm run dev

# Verificar tipos TypeScript
npx nuxi typecheck

# Build de produção
npm run build
```

---

## Ordem de Prioridade

```
1. Arquivos em app/ (raiz)           → Maior prioridade
2. layers/4-landing/                 → Prioridade 4
3. layers/3-dashboard/               → Prioridade 3
4. layers/2-auth/                    → Prioridade 2
5. layers/1-base/                    → Menor prioridade
```

Arquivos com mesmo nome em layers de maior prioridade sobrescrevem os de menor prioridade.

---

## Tailwind CSS v4 com Layers

### Problema

O Tailwind CSS v4 usa detecção automática de classes, mas por padrão só escaneia arquivos dentro de `app/`. Classes usadas em `layers/` não são detectadas.

### Solução

Adicione a diretiva `@source` no arquivo CSS principal para incluir as layers no scan:

```css
/* app/assets/css/tailwind.css */
@import "tailwindcss";
@import "tw-animate-css";

/* Incluir layers no scan do Tailwind v4 */
@source "../../../layers";

@custom-variant dark (&:is(.dark *));
/* ... resto do arquivo */
```

---

## shadcn-vue com Layers

### Configuração do components.json

Para que o CLI do shadcn-vue instale componentes em `layers/1-base/`, configure os aliases:

```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "new-york",
  "typescript": true,
  "tailwind": {
    "config": "",
    "css": "app/assets/css/tailwind.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "layers/1-base/app/components",
    "utils": "layers/1-base/app/utils/utils",
    "ui": "layers/1-base/app/components/ui",
    "lib": "layers/1-base/app/utils",
    "composables": "layers/1-base/app/composables"
  }
}
```

### Auto-import de utilitários

O Nuxt auto-importa funções de `app/utils/` e `layers/*/app/utils/`. Portanto, a função `cn()` não precisa de import explícito nos componentes:

```vue
<!-- NÃO precisa importar cn() -->
<script setup lang="ts">
// cn() é auto-importado de layers/1-base/app/utils/
</script>

<template>
  <div :class="cn('flex items-center', props.class)">
    <!-- ... -->
  </div>
</template>
```

### Adicionando novos componentes

```bash
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
npx shadcn-vue@latest add input
```

Os componentes serão instalados automaticamente em `layers/1-base/app/components/ui/`.

---

## Referências Oficiais

### Documentação Nuxt
- [Nuxt Docs - Layers](https://nuxt.com/docs/getting-started/layers)
- [Nuxt Docs - Going Further - Layers](https://nuxt.com/docs/guide/going-further/layers)
- [Nuxt 4 - Layers](https://nuxt.com/docs/4.x/getting-started/layers)

### Artigos da Comunidade
- [Building a Modular Monolith with Nuxt Layers](https://alexop.dev/posts/nuxt-layers-modular-monolith/)
- [Modular site architecture with Nuxt layers](https://davestewart.co.uk/blog/nuxt-layers/)
