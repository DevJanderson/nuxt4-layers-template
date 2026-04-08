# Nuxt 4 Template

[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

Template world-class para iniciar qualquer projeto com Nuxt 4, autenticacao BFF e arquitetura em layers.

## Sobre

Boilerplate opinado com fundacao completa: autenticacao BFF com JWT + cookies httpOnly, design system com shadcn-vue, testes em 3 niveis, quality gates e seguranca desde o primeiro commit.

## O que vem pronto

| Layer    | Descricao                                                        |
| -------- | ---------------------------------------------------------------- |
| **base** | Tailwind CSS 4, shadcn-vue, utils, tipos, domain, logger        |
| **auth** | Autenticacao BFF (cookies httpOnly, refresh, middleware, guards)  |
| **home** | Landing page generica                                            |

## Stack

| Categoria  | Tecnologia                          |
| ---------- | ----------------------------------- |
| Framework  | Nuxt 4, Vue 3.5, TypeScript         |
| UI         | Tailwind CSS 4, shadcn-vue          |
| State      | Pinia                               |
| Validacao  | Zod                                 |
| Qualidade  | ESLint, Prettier, Husky, Commitlint |
| Testes     | Vitest, Playwright                  |

## Inicio Rapido

```bash
npm install
npm run setup    # Configura git hooks
cp .env.example .env  # Configurar variaveis
npm run dev      # http://localhost:3000
```

## Comandos

```bash
# Desenvolvimento
npm run dev              # Servidor dev
npm run build            # Build producao
npm run typecheck        # Verificar tipos

# Qualidade de codigo
npm run quality:fix      # Lint + format

# Testes
npm run test             # Todos os testes
npm run test:unit        # Testes unitarios (Node puro)
npm run test:nuxt        # Testes com ambiente Nuxt
npm run test:e2e         # Testes E2E (Playwright)
```

## Estrutura

```
layers/
├── base/            # Fundacao: Tailwind, shadcn-vue, utils, tipos, domain
├── auth/            # Autenticacao BFF (cookies httpOnly, refresh)
└── home/            # Landing page

tests/               # unit/, integration/, e2e/
```

## Como usar como template

1. Clone ou use como template no GitHub
2. Renomeie `name` no `package.json`
3. Configure `.env` com suas variaveis
4. Atualize `app.config.ts` com sua marca
5. Crie novas layers em `layers/{feature}/` seguindo o padrao de `auth/`

## Licenca

MIT
