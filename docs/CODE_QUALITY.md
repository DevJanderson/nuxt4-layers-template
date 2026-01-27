# CODE_QUALITY.md

Guia de configuração de ferramentas de qualidade de código para Nuxt 4.

## Índice

1. [ESLint](#eslint)
2. [Prettier](#prettier)
3. [Husky + lint-staged](#husky--lint-staged)
4. [Commitlint](#commitlint)
5. [EditorConfig](#editorconfig)
6. [TypeScript Strict](#typescript-strict)
7. [Scripts de Qualidade](#scripts-de-qualidade)
8. [VS Code Settings](#vs-code-settings)

---

## ESLint

### Instalação

```bash
# ESLint para Nuxt 4 (módulo oficial)
npx nuxi module add eslint
```

### Configuração

```typescript
// eslint.config.mjs
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Vue
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/html-self-closing': ['error', {
      html: { void: 'always', normal: 'always', component: 'always' }
    }],

    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // Geral
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error'
  }
})
```

### Configuração no nuxt.config.ts

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],

  eslint: {
    config: {
      stylistic: true // Regras de estilo (opcional)
    }
  }
})
```

### Ignorar Arquivos

```gitignore
# .eslintignore
node_modules/
.nuxt/
.output/
dist/
coverage/
```

---

## Prettier

### Instalação

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

### Configuração

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false
}
```

### Ignorar Arquivos

```gitignore
# .prettierignore
node_modules/
.nuxt/
.output/
dist/
coverage/
package-lock.json
pnpm-lock.yaml
*.md
```

### Integrar com ESLint

```typescript
// eslint.config.mjs
import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default withNuxt(
  prettierConfig,
  {
    plugins: {
      prettier
    },
    rules: {
      'prettier/prettier': 'error'
    }
  }
)
```

---

## Husky + lint-staged

### Instalação

```bash
npm install -D husky lint-staged
npx husky init
```

### Configurar lint-staged

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

### Criar Hook pre-commit

```bash
# .husky/pre-commit
npx lint-staged
```

### Criar Hook commit-msg (para commitlint)

```bash
# .husky/commit-msg
npx --no -- commitlint --edit "$1"
```

---

## Commitlint

### Instalação

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

### Configuração

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Documentação
        'style',    // Formatação (sem mudança de código)
        'refactor', // Refatoração
        'perf',     // Melhoria de performance
        'test',     // Adição/correção de testes
        'chore',    // Tarefas de manutenção
        'ci',       // Mudanças em CI/CD
        'build',    // Mudanças em build
        'revert'    // Reverter commit
      ]
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100]
  }
}
```

### Exemplos de Commits Válidos

```bash
# Estrutura: type(scope): subject

feat: adiciona autenticação por OAuth
feat(auth): implementa login com Google
fix: corrige erro de validação no formulário
fix(users): resolve bug de duplicação de email
docs: atualiza README com instruções de deploy
style: formata código com prettier
refactor: extrai lógica de validação para composable
perf: otimiza query de listagem de usuários
test: adiciona testes para useAuth
chore: atualiza dependências
ci: adiciona workflow de deploy
build: configura Dockerfile para produção
```

### Commits Inválidos

```bash
# ❌ Tipo não permitido
update: muda algo

# ❌ Sem tipo
corrige bug

# ❌ Maiúscula no subject
feat: Adiciona nova feature

# ❌ Subject muito longo
feat: adiciona funcionalidade muito complexa que faz muitas coisas ao mesmo tempo
```

---

## EditorConfig

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

---

## TypeScript Strict

### Configuração Recomendada

```json
// tsconfig.json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Regras Explicadas

| Regra | Descrição |
|-------|-----------|
| `strict` | Habilita todas as verificações estritas |
| `noImplicitAny` | Erro quando tipo `any` é inferido |
| `strictNullChecks` | null/undefined não são atribuíveis a outros tipos |
| `noUnusedLocals` | Erro para variáveis não utilizadas |
| `noUnusedParameters` | Erro para parâmetros não utilizados |
| `noImplicitReturns` | Erro quando função não retorna em todos os caminhos |
| `noUncheckedIndexedAccess` | Acesso a índice pode ser undefined |

---

## Scripts de Qualidade

### package.json

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",

    "lint": "eslint .",
    "lint:fix": "eslint . --fix",

    "format": "prettier --write .",
    "format:check": "prettier --check .",

    "typecheck": "nuxt typecheck",

    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",

    "quality": "npm run typecheck && npm run lint && npm run test:run",
    "quality:fix": "npm run lint:fix && npm run format",

    "prepare": "husky"
  }
}
```

### Explicação dos Scripts

| Script | Uso |
|--------|-----|
| `lint` | Verifica erros de ESLint |
| `lint:fix` | Corrige erros automaticamente |
| `format` | Formata código com Prettier |
| `format:check` | Verifica se está formatado |
| `typecheck` | Verifica tipos TypeScript |
| `quality` | Roda todas as verificações |
| `quality:fix` | Corrige lint e formata |

---

## VS Code Settings

### .vscode/settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,

  "eslint.validate": [
    "javascript",
    "typescript",
    "vue"
  ],

  "files.associations": {
    "*.css": "tailwindcss"
  },

  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### .vscode/extensions.json

```json
{
  "recommendations": [
    "vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "editorconfig.editorconfig",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## Instalação Completa

### Comando Único

```bash
# Instalar todas as dependências de qualidade
npm install -D \
  @commitlint/cli \
  @commitlint/config-conventional \
  husky \
  lint-staged \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier

# Adicionar módulo ESLint do Nuxt
npx nuxi module add eslint

# Inicializar Husky
npx husky init

# Criar hooks
echo "npx lint-staged" > .husky/pre-commit
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

### Arquivos a Criar

```
.
├── .editorconfig
├── .prettierrc
├── .prettierignore
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── commitlint.config.js
├── eslint.config.mjs
└── .husky/
    ├── pre-commit
    └── commit-msg
```

---

## Checklist de Configuração

- [ ] ESLint instalado e configurado
- [ ] Prettier instalado e configurado
- [ ] ESLint + Prettier integrados
- [ ] Husky inicializado
- [ ] lint-staged configurado
- [ ] Hook pre-commit criado
- [ ] Commitlint instalado
- [ ] Hook commit-msg criado
- [ ] EditorConfig criado
- [ ] TypeScript strict habilitado
- [ ] VS Code settings configurados
- [ ] Scripts de qualidade no package.json

---

## Fluxo de Trabalho

```
1. Desenvolvedor edita arquivo
        ↓
2. VS Code auto-formata ao salvar (Prettier)
        ↓
3. ESLint mostra erros em tempo real
        ↓
4. git add + git commit
        ↓
5. Husky executa pre-commit hook
        ↓
6. lint-staged roda ESLint + Prettier nos arquivos staged
        ↓
7. Commitlint valida mensagem de commit
        ↓
8. Commit bem-sucedido ✓
```

---

## Referências

- [Nuxt ESLint](https://eslint.nuxt.com/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/lint-staged/lint-staged)
- [Commitlint](https://commitlint.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
