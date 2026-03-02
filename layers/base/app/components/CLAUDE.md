# Components - CLAUDE.md

Instruções específicas para componentes Vue.

## Estrutura

```
layers/base/app/components/
├── ui/                     # shadcn-vue (auto-import)
│   └── button/
│       ├── Button.vue
│       └── index.ts
└── common/                 # Componentes compartilhados (auto-import)
    └── AppLoading.vue
```

## Tipos de Componentes

| Pasta                                  | Uso                          | Auto-import |
| -------------------------------------- | ---------------------------- | ----------- |
| `layers/base/app/components/ui/`     | shadcn-vue (primitivos)      | ✅ Sim      |
| `layers/base/app/components/common/` | Componentes globais          | ✅ Sim      |
| `layers/*/app/components/`             | Específicos da feature layer | ✅ Sim      |

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

Componentes são instalados em `layers/base/app/components/ui/` (configurado via `components.json`).

## Usar Componentes

### shadcn-vue (auto-import)

```vue
<template>
  <!-- Não precisa importar -->
  <Button variant="outline" size="sm"> Clique aqui </Button>

  <Card>
    <CardHeader>
      <CardTitle>Título</CardTitle>
    </CardHeader>
    <CardContent> Conteúdo do card </CardContent>
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
<!-- layers/base/app/components/common/AppLogo.vue -->
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
<!-- layers/base/app/components/common/AppCard.vue -->
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
<!-- layers/base/app/components/common/AppInput.vue -->
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
  set: value => emit('update:modelValue', value)
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

| Item               | Convenção                        |
| ------------------ | -------------------------------- |
| Nome do arquivo    | `PascalCase.vue`                 |
| Nome do componente | `PascalCase`                     |
| Props              | Interface `Props` com TypeScript |
| Emits              | Tipados com `defineEmits<{}>()`  |
| CSS                | Tailwind CSS (utility classes)   |

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

---

## Testando Componentes

### Teste com Vue Test Utils

```typescript
// tests/unit/components/AppLogo.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppLogo from '~/layers/base/app/components/common/AppLogo.vue'

describe('AppLogo', () => {
  it('should render with default size', () => {
    const wrapper = mount(AppLogo)
    expect(wrapper.classes()).toContain('w-12')
  })

  it('should apply size class', () => {
    const wrapper = mount(AppLogo, {
      props: { size: 'lg' }
    })
    expect(wrapper.classes()).toContain('w-16')
  })
})
```

### Teste de Slots

```typescript
// tests/unit/components/AppCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppCard from '~/layers/base/app/components/common/AppCard.vue'

describe('AppCard', () => {
  it('should render default slot', () => {
    const wrapper = mount(AppCard, {
      slots: { default: 'Card content' }
    })
    expect(wrapper.text()).toContain('Card content')
  })

  it('should render title when provided', () => {
    const wrapper = mount(AppCard, {
      props: { title: 'My Title' }
    })
    expect(wrapper.text()).toContain('My Title')
  })

  it('should render footer slot', () => {
    const wrapper = mount(AppCard, {
      slots: {
        default: 'Content',
        footer: 'Footer content'
      }
    })
    expect(wrapper.text()).toContain('Footer content')
  })
})
```

### Teste de v-model

```typescript
// tests/unit/components/AppInput.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppInput from '~/layers/base/app/components/common/AppInput.vue'

describe('AppInput', () => {
  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(AppInput, {
      props: { modelValue: '' }
    })

    await wrapper.find('input').setValue('test')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test'])
  })

  it('should display error message', () => {
    const wrapper = mount(AppInput, {
      props: {
        modelValue: '',
        error: 'Campo obrigatório'
      }
    })
    expect(wrapper.text()).toContain('Campo obrigatório')
  })
})
```

### Teste com Testing Library

```typescript
// tests/unit/components/Button.test.ts
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import Button from '~/layers/base/app/components/ui/button/Button.vue'

describe('Button', () => {
  it('should render slot content', () => {
    render(Button, {
      slots: { default: 'Click me' }
    })
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const onClick = vi.fn()
    render(Button, {
      slots: { default: 'Click me' },
      attrs: { onClick }
    })

    await fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalled()
  })

  it('should be disabled when prop is set', () => {
    render(Button, {
      props: { disabled: true },
      slots: { default: 'Disabled' }
    })
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Padrões de Teste

| Componente            | O que testar                       |
| --------------------- | ---------------------------------- |
| Props                 | Valores padrão, diferentes valores |
| Slots                 | Default slot, named slots          |
| Events                | Emits corretos, payloads           |
| v-model               | Two-way binding                    |
| Conditional rendering | v-if, v-show                       |
| Classes dinâmicas     | Baseadas em props                  |

## Referências

- [shadcn-vue](https://www.shadcn-vue.com/)
- [Lucide Icons](https://lucide.dev/icons/)
- [Nuxt Components](https://nuxt.com/docs/guide/directory-structure/components)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library Vue](https://testing-library.com/docs/vue-testing-library/intro)
