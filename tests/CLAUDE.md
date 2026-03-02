# tests/CLAUDE.md

Instruções para testes neste repositório, seguindo o padrão Nuxt 4.

## Estrutura

```
tests/
├── setup.ts           # Setup global (mocks do Nuxt)
├── unit/              # Ambiente Node (rápido)
├── nuxt/              # Ambiente Nuxt (composables, componentes)
└── e2e/               # Playwright (end-to-end)
```

### Quando usar cada pasta

| Pasta   | Ambiente     | Velocidade | O que testar                      |
| ------- | ------------ | ---------- | --------------------------------- |
| `unit/` | Node puro    | ⚡ Rápido  | Funções puras, utils, validadores |
| `nuxt/` | Runtime Nuxt | 🐢 Médio   | Composables, stores, componentes  |
| `e2e/`  | Browser real | 🐌 Lento   | Fluxos completos, navegação       |

## Ferramentas

| Ferramenta           | Uso                       |
| -------------------- | ------------------------- |
| Vitest               | Testes unitários e nuxt   |
| Playwright           | Testes E2E (end-to-end)   |
| @vue/test-utils      | Montar componentes Vue    |
| @testing-library/vue | Testes focados no usuário |
| happy-dom            | DOM environment           |

## Comandos

```bash
# Testes unitários (Vitest)
npm run test           # Watch mode
npm run test:run       # Executa uma vez
npm run test:coverage  # Com cobertura
npm run test:ui        # Interface visual

# Testes E2E (Playwright)
npm run test:e2e           # Executa testes
npm run test:e2e:ui        # Interface visual
npm run test:e2e:headed    # Com browser visível
npm run test:e2e:install   # Instala browsers
```

## Teste Unitário (tests/unit/)

Para funções puras que não dependem do Nuxt:

```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest'

function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

describe('formatCPF', () => {
  it('should format CPF correctly', () => {
    expect(formatCPF('12345678901')).toBe('123.456.789-01')
  })
})
```

## Teste Nuxt (tests/nuxt/)

Para código que precisa do runtime Nuxt (composables, stores, componentes):

### Teste de Composable

```typescript
// tests/nuxt/composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'

describe('useCounter', () => {
  it('should increment counter', () => {
    const { count, increment } = useCounter()
    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })
})
```

### Teste de Store (Pinia)

```typescript
// tests/nuxt/stores/example.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('useExampleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should start empty', () => {
    const store = useExampleStore()
    expect(store.items).toEqual([])
  })
})
```

### Teste de Componente

```typescript
// tests/nuxt/components/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '~/layers/base/app/components/ui/button/Button.vue'

describe('Button', () => {
  it('should render slot content', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toContain('Click me')
  })
})
```

## Teste E2E (tests/e2e/)

```typescript
// tests/e2e/home.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Nuxt/)
  })
})
```

## Mocking

### Mock de $fetch (em tests/nuxt/)

```typescript
import { vi } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

it('should call API', async () => {
  mockFetch.mockResolvedValue([{ id: '1', name: 'Test' }])

  const api = useExampleApi()
  const result = await api.getAll()

  expect(mockFetch).toHaveBeenCalledWith('/api/examples')
})
```

## Boas Práticas

### Nomenclatura

```typescript
// ✅ BOM - Descreve comportamento
it('should show error when email is invalid', () => {})

// ❌ RUIM - Vago
it('test 1', () => {})
```

### Data-testid para E2E

```vue
<!-- ✅ BOM - Seletor estável -->
<button data-testid="submit-button">Enviar</button>

<!-- ❌ RUIM - Seletor frágil -->
<button class="btn btn-primary">Enviar</button>
```

## Referências

- [Nuxt 4 Testing](https://nuxt.com/docs/4.x/getting-started/testing)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
