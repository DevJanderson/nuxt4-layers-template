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
- Ordem de prioridade configurável via prefixos numéricos

> **IMPORTANTE:** Use hífen (`-`) e não ponto (`.`) no nome das pastas de layers. O ponto causa problemas na resolução de módulos do Nuxt. Exemplo: use `1-base` em vez de `1.base`.

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
│   ├── 0-core/                     # Fundação: app.vue, error.vue, CSS
│   │   └── app/
│   │       ├── app.vue
│   │       ├── error.vue
│   │       └── assets/css/main.css
│   │
│   ├── 1-base/                     # UI: shadcn-vue, utils, tipos
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── ui/             # shadcn-vue
│   │   │   │   └── common/         # Componentes compartilhados
│   │   │   ├── composables/        # Composables globais
│   │   │   ├── layouts/            # Layout padrão
│   │   │   └── utils/              # Funções utilitárias
│   │   └── shared/types/           # Tipos globais (via alias #shared)
│   │
│   ├── 2-example/                  # Feature: Módulo de exemplo
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   └── pages/example/
│   │   └── server/api/example/
│   │
│   └── 4-landing/                  # Feature: Landing page
│       └── app/pages/
│
├── server/                         # API routes globais (opcional)
├── tests/                          # Testes (unit, e2e)
├── nuxt.config.ts
└── package.json
```

### Responsabilidade de cada Layer

| Layer | Responsabilidade |
|-------|------------------|
| `0-core` | Fundação: `app.vue`, `error.vue`, CSS global, variáveis de tema |
| `1-base` | UI compartilhada: shadcn-vue, layouts, utils, tipos globais |
| `2-*` a `N-*` | Features específicas: páginas, componentes, API |

---

## Ordem de Prioridade

```
4-landing > 2-example > 1-base > 0-core
```

**Regra:** Número MAIOR = MAIOR prioridade = sobrescreve layers anteriores.

Exemplo: Se `1-base` e `2-example` definem um componente com mesmo nome, o de `2-example` será usado.

---

## Criando uma Nova Feature Layer

### 1. Copiar layer de exemplo

```bash
cp -r layers/2-example layers/3-minha-feature
```

### 2. Renomear arquivos

Substitua `example/Example` pelo nome da sua feature:

```bash
# Estrutura final
layers/3-minha-feature/
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
// layers/3-minha-feature/nuxt.config.ts
export default defineNuxtConfig({
  // Configurações específicas (pode estar vazio)
})
```

> **Nota:** Layers em `~/layers` são auto-registradas (Nuxt v3.12+). Não precisa declarar em `extends`.

### Caminhos em Layers

Ao referenciar arquivos dentro de uma layer (como CSS), use o alias `~` (raiz do projeto):

```ts
// ✅ Correto - usa alias da raiz
export default defineNuxtConfig({
  css: ['~/layers/0-core/app/assets/css/main.css']
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
/* layers/0-core/app/assets/css/main.css */
@import "tailwindcss";
@import "tw-animate-css";

/* Incluir todo o projeto no scan do Tailwind v4 */
@source "../../../../";

@custom-variant dark (&:is(.dark *));
/* ... resto do arquivo */
```

---

## shadcn-vue com Layers

### Configuração do components.json

Para que o CLI do shadcn-vue instale componentes em `layers/1-base/`:

```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "new-york",
  "typescript": true,
  "tailwind": {
    "config": "",
    "css": "layers/0-core/app/assets/css/main.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "layers/1-base/app/components",
    "utils": "layers/1-base/app/utils/utils",
    "ui": "layers/1-base/app/components/ui"
  }
}
```

### Adicionando componentes

```bash
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
```

Componentes são instalados em `layers/1-base/app/components/ui/` e auto-importados.

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
