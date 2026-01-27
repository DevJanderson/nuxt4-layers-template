# Components - CLAUDE.md

Instruções específicas para componentes Vue.

## Estrutura

```
layers/1-base/app/components/
├── ui/                     # shadcn-vue (auto-import)
│   └── button/
│       ├── Button.vue
│       └── index.ts
└── common/                 # Componentes compartilhados (auto-import)
    └── AppLoading.vue
```

## Tipos de Componentes

| Pasta | Uso | Auto-import |
|-------|-----|-------------|
| `layers/1-base/app/components/ui/` | shadcn-vue (primitivos) | ✅ Sim |
| `layers/1-base/app/components/common/` | Componentes globais | ✅ Sim |
| `layers/*/app/components/` | Específicos da feature layer | ✅ Sim |

## Adicionar Componente shadcn-vue

```bash
# Adicionar um componente
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
npx shadcn-vue@latest add input
npx shadcn-vue@latest add dialog

# Ver componentes disponíveis
npx shadcn-vue@latest add --help
```

Componentes são instalados em `layers/1-base/app/components/ui/` (configurado via `components.json`).

## Usar Componentes

### shadcn-vue (auto-import)

```vue
<template>
  <!-- Não precisa importar -->
  <Button variant="outline" size="sm">
    Clique aqui
  </Button>

  <Card>
    <CardHeader>
      <CardTitle>Título</CardTitle>
    </CardHeader>
    <CardContent>
      Conteúdo do card
    </CardContent>
  </Card>
</template>
```

### Props do Button

```vue
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

## Criar Componente Comum

### Componente simples

```vue
<!-- layers/1-base/app/components/common/AppLogo.vue -->
<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
}
</script>

<template>
  <div :class="['rounded-lg bg-primary', sizeClasses[size]]">
    <span class="text-primary-foreground font-bold">Logo</span>
  </div>
</template>
```

### Uso (auto-import)

```vue
<template>
  <AppLogo size="lg" />
</template>
```

## Componente com Slots

```vue
<!-- layers/1-base/app/components/common/AppCard.vue -->
<script setup lang="ts">
interface Props {
  title?: string
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-lg border bg-card p-6">
    <h3 v-if="title" class="font-semibold mb-4">{{ title }}</h3>
    <slot />
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t">
      <slot name="footer" />
    </div>
  </div>
</template>
```

### Uso

```vue
<template>
  <AppCard title="Meu Card">
    <p>Conteúdo principal</p>

    <template #footer>
      <Button>Ação</Button>
    </template>
  </AppCard>
</template>
```

## Componente com v-model

```vue
<!-- layers/1-base/app/components/common/AppInput.vue -->
<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="text-sm font-medium">{{ label }}</label>
    <Input v-model="inputValue" :class="{ 'border-destructive': error }" />
    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
  </div>
</template>
```

## Convenções

| Item | Convenção |
|------|-----------|
| Nome do arquivo | `PascalCase.vue` |
| Nome do componente | `PascalCase` |
| Props | Interface `Props` com TypeScript |
| Emits | Tipados com `defineEmits<{}>()` |
| CSS | Tailwind CSS (utility classes) |

## Ícones (Lucide)

```vue
<script setup>
import { Search, User, Settings } from 'lucide-vue-next'
</script>

<template>
  <Button>
    <Search class="w-4 h-4 mr-2" />
    Buscar
  </Button>
</template>
```

## Referências

- [shadcn-vue](https://www.shadcn-vue.com/)
- [Lucide Icons](https://lucide.dev/icons/)
- [Nuxt Components](https://nuxt.com/docs/guide/directory-structure/components)
