# Nuxt 4 Layers - Guia de Implementação

Guia completo para implementar arquitetura modular com Nuxt Layers seguindo os padrões da comunidade.

---

## Sumário

1. [O que são Layers?](#o-que-são-layers)
2. [Arquitetura Layers-Only](#arquitetura-layers-only)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Ordem de Prioridade](#ordem-de-prioridade)
5. [Criando uma Nova Feature Layer](#criando-uma-nova-feature-layer)
6. [Tailwind CSS v4 com Layers](#tailwind-css-v4-com-layers)
7. [shadcn-vue com Layers](#shadcn-vue-com-layers)
8. [Referências](#referências)

---

## O que são Layers?

Layers são módulos independentes que permitem:

- Separação de responsabilidades (core, auth, dashboard, landing, etc.)
- Reutilização de código entre projetos
- Ordem de prioridade configurável via `extends` explícito

> **IMPORTANTE:** Use hífen (`-`) e não ponto (`.`) no nome das pastas de layers. O ponto causa problemas na resolução de módulos do Nuxt.

---

## Arquitetura Layers-Only

Este template usa **arquitetura layers-only** - não existe pasta `app/` na raiz do projeto. Tudo fica em layers.

### Por que layers-only?

1. **Consistência** - Tudo segue o mesmo padrão
2. **Reutilização** - Facilita extrair/substituir módulos
3. **Clareza** - Cada layer tem responsabilidade definida
4. **Padrão da comunidade** - Abordagem recomendada para projetos modulares

---

## Estrutura do Projeto

```
projeto/
├── layers/                         # TUDO fica aqui
│   ├── base/                       # Fundação + UI: app.vue, CSS, shadcn-vue, utils
│   │   ├── app/
│   │   │   ├── app.vue
│   │   │   ├── error.vue
│   │   │   ├── assets/css/main.css
│   │   │   ├── components/
│   │   │   │   ├── ui/             # shadcn-vue
│   │   │   │   └── common/         # Componentes compartilhados
│   │   │   ├── composables/        # Composables globais
│   │   │   ├── layouts/            # Layout padrão
│   │   │   └── utils/              # Funções utilitárias
│   │   └── shared/types/           # Tipos globais (via alias #shared)
│   │
│   ├── example/                    # Feature: Módulo de exemplo
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   └── pages/example/
│   │   └── server/api/example/
│   │
│   ├── auth/                       # Autenticação BFF
│   │   ├── app/
│   │   └── server/api/auth/
│   │
│   └── docs/                       # Documentação markdown
│       └── app/
│
├── tests/                          # Testes (unit, nuxt, e2e)
├── nuxt.config.ts
└── package.json
```

### Responsabilidade de cada Layer

| Layer     | Responsabilidade                                                      |
| --------- | --------------------------------------------------------------------- |
| `base`    | Fundação + UI: `app.vue`, CSS global, shadcn-vue, layouts, utils      |
| `example` | Feature de exemplo (template para criar novas)                        |
| `auth`    | Autenticação BFF com cookies httpOnly                                 |
| `docs`    | Documentação markdown com @nuxt/content                               |

---

## Ordem de Prioridade

A prioridade é definida pela ordem no array `extends` do `nuxt.config.ts` raiz:

```typescript
extends: ['./layers/base', './layers/example', './layers/auth', './layers/docs'],
```

```
docs > auth > example > base
```

**Regra:** Último no `extends` = MAIOR prioridade = sobrescreve layers anteriores.

Exemplo: Se `base` e `example` definem um componente com mesmo nome, o de `example` será usado.

---

## Criando uma Nova Feature Layer

### 1. Copiar layer de exemplo

```bash
cp -r layers/example layers/minha-feature
```

### 2. Renomear arquivos

Substitua `example/Example` pelo nome da sua feature:

```bash
# Estrutura final
layers/minha-feature/
├── nuxt.config.ts
├── app/
│   ├── components/
│   │   └── MinhaFeatureCard.vue
│   ├── composables/
│   │   ├── types.ts
│   │   ├── useMinhaFeatureApi.ts
│   │   └── useMinhaFeatureStore.ts
│   └── pages/minha-feature/
│       └── index.vue
└── server/api/minha-feature/
```

### 3. Configurar nuxt.config.ts

```ts
// layers/minha-feature/nuxt.config.ts
export default defineNuxtConfig({
  // Configurações específicas (pode estar vazio)
})
```

### 4. Registrar no `extends`

Adicione a nova layer ao array `extends` no `nuxt.config.ts` raiz:

```ts
extends: ['./layers/base', './layers/example', './layers/auth', './layers/docs', './layers/minha-feature'],
```

### Caminhos em Layers

Ao referenciar arquivos dentro de uma layer (como CSS), use o alias `~` (raiz do projeto):

```ts
// ✅ Correto - usa alias da raiz
export default defineNuxtConfig({
  css: ['~/layers/base/app/assets/css/main.css']
})

// ❌ Incorreto - caminho relativo não funciona em layers
export default defineNuxtConfig({
  css: ['./app/assets/css/main.css']
})
```

O Nuxt resolve caminhos a partir da raiz do projeto, não da pasta da layer.

---

## Tailwind CSS v4 com Layers

### Problema

O Tailwind CSS v4 usa detecção automática de classes, mas por padrão só escaneia a raiz. Classes usadas em `layers/` não são detectadas.

### Solução

A diretiva `@source` no CSS principal inclui todas as layers no scan:

```css
/* layers/base/app/assets/css/main.css */
@import 'tailwindcss';
@import 'tw-animate-css';

/* Incluir todo o projeto no scan do Tailwind v4 */
@source "../../../../";

@custom-variant dark (&:is(.dark *));
/* ... resto do arquivo */
```

---

## shadcn-vue com Layers

### Configuração do components.json

Para que o CLI do shadcn-vue instale componentes em `layers/base/`:

```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "new-york",
  "typescript": true,
  "tailwind": {
    "config": "",
    "css": "@/layers/base/app/assets/css/main.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/layers/base/app/components",
    "utils": "@/layers/base/app/utils/utils",
    "ui": "@/layers/base/app/components/ui",
    "lib": "@/layers/base/app/utils",
    "composables": "@/layers/base/app/composables"
  }
}
```

### Adicionando componentes

```bash
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
```

Componentes são instalados em `layers/base/app/components/ui/` e auto-importados.

---

## Referências

### Documentação Nuxt

- [Nuxt 4 - Layers](https://nuxt.com/docs/4.x/getting-started/layers)
- [Authoring Nuxt Layers](https://nuxt.com/docs/4.x/guide/going-further/layers)

### Artigos da Comunidade

- [Building a Modular Monolith with Nuxt Layers](https://alexop.dev/posts/nuxt-layers-modular-monolith/)
- [Modular site architecture with Nuxt layers](https://davestewart.co.uk/blog/nuxt-layers/)

### Repositórios de Exemplo

- [alexanderop/nuxt-layer-example](https://github.com/alexanderop/nuxt-layer-example)
- [davestewart/nuxt-layers-demo](https://github.com/davestewart/nuxt-layers-demo)
