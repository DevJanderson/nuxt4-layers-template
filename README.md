# Nuxt 4 Template

[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

Boilerplate opinado para iniciar qualquer projeto Nuxt 4 com design system e quality gates prontos.

## Inicio

1. Clique em **"Use this template"** no GitHub
2. Clone o novo repositorio
3. Configure:

```bash
pnpm install
pnpm setup               # git hooks (husky, commitlint, lint-staged)
cp .env.example .env     # edite com suas variaveis
pnpm dev                 # http://localhost:3000
```

## Personalizacao

| O que                 | Onde                                  | O que fazer                          |
| --------------------- | ------------------------------------- | ------------------------------------ |
| Nome do projeto       | `package.json`                        | Alterar campo `name`                 |
| Marca (logo, nav)     | `app.config.ts`                       | Substituir logos, links, copyright   |
| Variaveis de ambiente | `.env`                                | URL da API, nome do site, descricao  |
| Paleta de cores       | `layers/base/app/assets/css/main.css` | Ajustar tokens CSS                   |
| SEO global            | `nuxt.config.ts`                      | `site.name`, `site.url`, `schemaOrg` |
| Seguranca             | `nuxt.config.ts`                      | CSP, rate limiter, CSRF por rota     |

## Criando uma nova feature

Cada feature e uma **Nuxt Layer** independente:

```
layers/{feature}/
├── nuxt.config.ts
├── app/
│   ├── components/             # {Feature}Nome.vue
│   ├── composables/
│   │   ├── use{Feature}Api.ts  # Service ($fetch → BFF)
│   │   └── use{Feature}Store.ts # Pinia store
│   ├── types/index.ts
│   ├── utils/
│   └── pages/{feature}/
└── server/api/{feature}/       # Endpoints BFF
```

Depois de criar a layer, registre em `nuxt.config.ts`:

```ts
extends: ['./layers/base', './layers/home', './layers/{feature}']
```

## O que vem pronto

| Layer    | O que inclui                                                                             |
| -------- | ---------------------------------------------------------------------------------------- |
| **base** | Tailwind CSS 4, shadcn-vue, design tokens, utils, domain types, logger, validacao server |
| **home** | Landing page generica                                                                    |

## Comandos

```bash
pnpm dev                 # Servidor dev
pnpm build               # Build producao
pnpm typecheck           # Verificar tipos
pnpm quality:fix         # Lint + format
pnpm test                # Unit + integration
pnpm test:e2e            # Playwright E2E
```

## Licenca

MIT
