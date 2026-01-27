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
- **ESLint + Prettier** - Qualidade de código
- **Husky + Commitlint** - Git hooks e commits padronizados
- **Vitest + Playwright** - Testes unitários e E2E

## Stack

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Nuxt 4, Vue 3.5, TypeScript |
| UI | Tailwind CSS 4, shadcn-vue |
| State | Pinia |
| Validação | Zod, VeeValidate |
| Imagens | @nuxt/image |
| Tema | @nuxtjs/color-mode |
| Qualidade | ESLint, Prettier, Husky, Commitlint |
| Testes | Vitest, Playwright, Testing Library |

## Início Rápido

```bash
npx degit DevJanderson/nuxt4-layers-template meu-projeto
cd meu-projeto
npm install
npm run setup    # Configura git hooks (Husky)
npm run dev
```

### Alternativas

<details>
<summary>GitHub Template</summary>

1. Clique em **"Use this template"** no GitHub
2. Clone seu novo repositório
3. Instale e configure:

```bash
npm install
npm run setup
npm run dev
```
</details>

<details>
<summary>Clone Manual</summary>

```bash
git clone https://github.com/DevJanderson/nuxt4-layers-template.git meu-projeto
cd meu-projeto
rm -rf .git
git init
npm install
npm run setup
git add .
git commit -m "Initial commit"
npm run dev
```
</details>

## Comandos

```bash
# Desenvolvimento
npm run dev          # Servidor dev (http://localhost:3000)
npm run build        # Build produção
npm run preview      # Preview build

# Qualidade de código
npm run lint         # Verificar ESLint
npm run lint:fix     # Corrigir ESLint
npm run format       # Formatar com Prettier
npm run typecheck    # Verificar tipos TypeScript
npm run quality      # Rodar todas as verificações
npm run quality:fix  # Corrigir lint + formatar

# Testes
npm run test         # Testes unitários (watch)
npm run test:run     # Testes unitários (uma vez)
npm run test:e2e     # Testes E2E (Playwright)
```

## Qualidade de Código

O template inclui ferramentas de qualidade pré-configuradas:
- **ESLint** - Linting (módulo oficial @nuxt/eslint)
- **Prettier** - Formatação
- **Husky** - Git hooks
- **Commitlint** - Padronização de commits

### Configurar Git Hooks

```bash
npm run setup    # Configura Husky automaticamente
```

### Commits Padronizados (Conventional Commits)

```bash
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração
chore: tarefas de manutenção
```


## Testes

O template inclui configuração completa para testes:
- **Vitest** - Testes unitários e de integração
- **Playwright** - Testes E2E (end-to-end)
- **Testing Library** - Testes de componentes

### Comandos de Teste

```bash
# Testes unitários (Vitest)
npm run test           # Watch mode
npm run test:run       # Executa uma vez
npm run test:coverage  # Com cobertura
npm run test:ui        # Interface visual

# Testes E2E (Playwright)
npm run test:e2e           # Executa testes E2E
npm run test:e2e:ui        # Interface visual do Playwright
npm run test:e2e:headed    # Executa com browser visível
npm run test:e2e:install   # Instala browsers do Playwright
```

### Estrutura de Testes

```
tests/
├── setup.ts           # Setup global (mocks do Nuxt)
├── unit/              # Testes unitários
├── integration/       # Testes de integração
└── e2e/               # Testes E2E (Playwright)
    └── example.spec.ts
```

### Primeiro uso do Playwright

```bash
npm run test:e2e:install   # Instala browsers necessários
npm run test:e2e           # Executa testes
```

> Veja mais em [tests/CLAUDE.md](tests/CLAUDE.md)

## Estrutura

**Arquitetura layers-only** - não existe pasta `app/` na raiz. Tudo fica em layers.

```
projeto/
├── layers/                         # TUDO fica aqui
│   ├── 0-core/                     # Fundação: app.vue, error.vue, CSS
│   ├── 1-base/                     # UI: shadcn-vue, utils, tipos
│   │   ├── app/components/ui/      # shadcn-vue
│   │   ├── app/components/common/  # Componentes compartilhados
│   │   └── app/utils/              # Funções utilitárias
│   ├── 2-example/                  # Feature: Módulo de exemplo
│   └── 4-landing/                  # Feature: Landing page
│
├── server/                         # API routes (Nitro)
└── tests/                          # Testes (unit, e2e)
```

> **Nota:** Use hífen (`-`) no nome das layers (ex: `1-base`), não ponto.

### Ordem de Prioridade (Layers)

```
4-landing > 2-example > 1-base > 0-core
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

> **Caminhos em layers:** Use `~/layers/...` para referenciar arquivos no `nuxt.config.ts` de layers. Caminhos relativos não funcionam.

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
