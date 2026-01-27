# Layer 0-core - CLAUDE.md

Fundação da aplicação. Contém arquivos globais que toda aplicação Nuxt precisa.

## Estrutura

```
layers/0-core/
├── nuxt.config.ts          # Configuração (CSS global)
└── app/
    ├── app.vue             # Root component
    ├── error.vue           # Página de erro (404, 500)
    └── assets/css/
        └── main.css        # Tailwind CSS + variáveis de tema
```

## Arquivos

| Arquivo | Função |
|---------|--------|
| `app.vue` | Root component com `<NuxtLayout>` e `<NuxtPage>` |
| `error.vue` | Página de erro global com tratamento de 404 e outros erros |
| `main.css` | Configuração Tailwind v4, variáveis CSS (dark/light mode) |

## Configuração do CSS

No `nuxt.config.ts` desta layer, o CSS deve ser referenciado usando o alias `~` (raiz do projeto):

```ts
// layers/0-core/nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/layers/0-core/app/assets/css/main.css']
})
```

> **IMPORTANTE:** Não use caminhos relativos como `./app/assets/css/main.css` em layers. O Nuxt resolve caminhos a partir da raiz do projeto, então use sempre `~/layers/...` para evitar erros de módulo não encontrado.

## Prioridade

Esta é a layer com **menor prioridade** (0). Todas as outras layers podem sobrescrever seus arquivos.

```
0-core < 1-base < 2-example < 4-landing
```

## Customização

Para customizar em um projeto derivado do template:

- **Tema**: Edite as variáveis CSS em `main.css` (`:root` e `.dark`)
- **Layout raiz**: Sobrescreva `app.vue` em uma layer de maior prioridade
- **Página de erro**: Sobrescreva `error.vue` em uma layer de maior prioridade
