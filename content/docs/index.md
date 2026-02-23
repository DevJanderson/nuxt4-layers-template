---
title: Documentação
description: Documentação do projeto
---

# Documentação

Bem-vindo à documentação do projeto.

## Início Rápido

```bash
npm install
npm run dev
```

## Arquitetura

Este projeto usa **Nuxt 4** com arquitetura de **Layers**:

- `0-base/` — Fundação + UI (shadcn-vue, Tailwind CSS)
- `1-example/` — Feature layer de exemplo
- `2-auth/` — Autenticação BFF com cookies httpOnly
- `2-docs/` — Documentação (esta layer)

## Criando Conteúdo

Adicione arquivos `.md` em `content/docs/` para criar novas páginas:

```
content/docs/
├── index.md          → /docs
├── guia.md           → /docs/guia
└── api/
    └── endpoints.md  → /docs/api/endpoints
```
