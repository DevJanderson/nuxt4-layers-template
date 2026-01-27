# Nuxt 4 Layers Template

[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Template profissional para Nuxt 4 com shadcn-vue, Tailwind CSS v4 e arquitetura modular com Nuxt Layers.

## Features

- **Nuxt 4** - Framework Vue full-stack
- **Nuxt Layers** - Arquitetura modular escalável
- **Vue 3.5** - Composition API
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn-vue** - Componentes acessíveis (UI primitivos)
- **Pinia** - State management
- **Zod + VeeValidate** - Validação de formulários
- **Dark Mode** - Tema claro/escuro

## Stack

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Nuxt 4, Vue 3.5, TypeScript |
| UI | Tailwind CSS 4, shadcn-vue |
| State | Pinia |
| Validação | Zod, VeeValidate |
| Imagens | @nuxt/image |
| Tema | @nuxtjs/color-mode |

## Início Rápido

### GitHub Template

1. Clique em **"Use this template"**
2. Clone seu novo repositório
3. Instale e execute:

```bash
npm install
npm run dev
```

### Degit (recomendado)

```bash
npx degit DevJanderson/nuxt4-layers-template meu-projeto
cd meu-projeto
npm install
npm run dev
```

### Clone Manual

Se preferir clonar diretamente, reinicie o histórico do git:

```bash
git clone https://github.com/DevJanderson/nuxt4-layers-template.git meu-projeto
cd meu-projeto
rm -rf .git
git init
git add .
git commit -m "Initial commit"
npm install
npm run dev
```

## Comandos

```bash
npm run dev      # Desenvolvimento (http://localhost:3000)
npm run build    # Build produção
npm run preview  # Preview build
```

## Estrutura

```
projeto/
├── app/                            # Arquivos globais
│   ├── app.vue                     # Root component
│   ├── error.vue                   # Página de erro global
│   ├── assets/css/                 # CSS global (Tailwind)
│   └── layouts/default.vue         # Layout padrão
│
├── layers/                         # Features modulares
│   ├── 1-base/                     # Shared Layer (fundação)
│   │   ├── app/components/ui/      # shadcn-vue
│   │   ├── app/components/common/  # Componentes compartilhados
│   │   ├── app/utils/              # Funções utilitárias (cn)
│   │   └── shared/types/           # Tipos globais
│   ├── 2-example/                  # Feature: Módulo de exemplo
│   └── 4-landing/                  # Feature: Landing page
│
└── server/                         # API routes (Nitro)
```

> **Nota:** Use hífen (`-`) no nome das layers (ex: `1-base`), não ponto.

### Arquivos Especiais

| Arquivo | Função |
|---------|--------|
| `app/app.vue` | Root component da aplicação |
| `app/error.vue` | Página de erro global (404, 500) |
| `app/layouts/default.vue` | Layout padrão (fallback) |

### Ordem de Prioridade (Layers)

```
app/ > 4-landing > 2-example > 1-base
```

Número maior = maior prioridade = sobrescreve layers anteriores.

### Criando uma Nova Feature Layer

1. Crie a pasta `layers/N-nome-feature/`
2. Adicione `nuxt.config.ts` (pode estar vazio)
3. Estruture com `app/` para código Vue e `server/` para API

```
layers/5-minha-feature/
├── nuxt.config.ts
├── app/
│   ├── components/
│   ├── composables/
│   └── pages/minha-feature/
└── server/api/
```

> Layers em `~/layers` são auto-registradas (Nuxt v3.12+). Não precisa declarar em `extends`.

## Adicionando Componentes shadcn-vue

```bash
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
npx shadcn-vue@latest add input
```

Componentes são instalados em `layers/1-base/app/components/ui/` e auto-importados.

## Validação com Zod

```typescript
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

// No componente
const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema)
})
```

## Dark Mode

```vue
<script setup>
const colorMode = useColorMode()
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
```

## Variáveis de Ambiente

```bash
cp .env.example .env
```

```env
API_BASE_URL=/api
JWT_SECRET=sua-chave-secreta
```

## Licença

MIT
