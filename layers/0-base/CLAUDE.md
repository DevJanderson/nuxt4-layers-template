# Layer 0-base - CLAUDE.md

Fundação + UI da aplicação. Contém arquivos globais do Nuxt, componentes shadcn-vue, utils e tipos compartilhados.

## Estrutura

```
layers/0-base/
├── nuxt.config.ts              # CSS global + alias #shared
├── app/
│   ├── app.vue                 # Root component
│   ├── error.vue               # Página de erro (404, 500)
│   ├── assets/css/
│   │   └── main.css            # Tailwind CSS + variáveis de tema
│   ├── components/
│   │   ├── ui/                 # shadcn-vue (auto-import)
│   │   └── common/             # Componentes compartilhados
│   ├── layouts/
│   │   └── default.vue         # Layout padrão
│   ├── pages/
│   │   └── index.vue           # Página inicial
│   └── utils/
│       └── utils.ts            # cn() para classes
├── server/
│   └── api/
│       └── health.get.ts       # GET /api/health
└── shared/
    └── types/                  # Tipos compartilhados (app + server)
```

## Responsabilidades

| Item | Descrição |
|------|-----------|
| `app.vue` | Root component com `<NuxtLayout>` e `<NuxtPage>` |
| `error.vue` | Página de erro global |
| `main.css` | Tailwind v4, variáveis CSS (dark/light mode) |
| `components/ui/` | Componentes shadcn-vue (primitivos de UI) |
| `components/common/` | Componentes globais reutilizáveis |
| `layouts/default.vue` | Layout padrão da aplicação |
| `utils/` | Funções utilitárias (cn, formatters) |
| `shared/types/` | Tipos TypeScript compartilhados |

## Adicionar Componentes shadcn-vue

```bash
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
```

Os componentes são instalados automaticamente em `app/components/ui/`.

## Customização

- **Tema**: Edite as variáveis CSS em `main.css` (`:root` e `.dark`)
- **Layout**: Sobrescreva `layouts/default.vue` em uma layer de maior prioridade

## Prioridade

Esta é a layer com **menor prioridade** (0). Todas as outras layers podem sobrescrever seus arquivos.

```
0-base < 1-example
```
