# tests/CLAUDE.md

Instruções para testes neste repositório.

## Estrutura

```
tests/
├── setup.ts           # Setup global (mocks do Nuxt)
├── unit/              # Testes unitários
├── integration/       # Testes de integração
└── e2e/               # Testes E2E (Playwright)
```

## Ferramentas

| Ferramenta | Uso |
|------------|-----|
| Vitest | Testes unitários e integração |
| Playwright | Testes E2E (end-to-end) |
| @vue/test-utils | Montar componentes Vue |
| @testing-library/vue | Testes focados no usuário |
| happy-dom | DOM environment |

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

## Teste Unitário

### Teste Básico

```typescript
// tests/unit/example.test.ts
import { describe, it, expect } from 'vitest'

describe('Example', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### Teste de Composable

```typescript
// tests/unit/composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from '~/composables/useCounter'

describe('useCounter', () => {
  it('should start at 0', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('should increment', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })
})
```

### Teste de Componente (Vue Test Utils)

```typescript
// tests/unit/components/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '~/components/ui/button/Button.vue'

describe('Button', () => {
  it('should render slot content', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('should emit click event', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
```

### Teste de Componente (Testing Library)

```typescript
// tests/unit/components/Form.test.ts
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import LoginForm from '~/components/LoginForm.vue'

describe('LoginForm', () => {
  it('should show email field', () => {
    render(LoginForm)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('should call onSubmit with form data', async () => {
    const onSubmit = vi.fn()
    render(LoginForm, { props: { onSubmit } })

    await fireEvent.update(screen.getByLabelText(/email/i), 'test@example.com')
    await fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' })
  })
})
```

### Teste de Store (Pinia)

```typescript
// tests/unit/stores/example.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExampleStore } from '~/stores/example'

describe('useExampleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should start empty', () => {
    const store = useExampleStore()
    expect(store.items).toEqual([])
  })

  it('should fetch items', async () => {
    const store = useExampleStore()
    await store.fetchAll()
    expect(store.items.length).toBeGreaterThan(0)
  })
})
```

## Teste E2E (Playwright)

### Teste de Página

```typescript
// tests/e2e/home.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Nuxt/)
  })

  test('should navigate to example', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/example"]')
    await expect(page).toHaveURL('/example')
  })
})
```

### Teste de Formulário

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'user@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="submit"]')

    await page.waitForURL('/dashboard')
    expect(page.url()).toContain('/dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'invalid@example.com')
    await page.fill('[data-testid="password"]', 'wrong')
    await page.click('[data-testid="submit"]')

    await expect(page.locator('[data-testid="error"]')).toBeVisible()
  })
})
```

### Teste Mobile

```typescript
// tests/e2e/mobile.spec.ts
import { test, expect } from '@playwright/test'

test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  await expect(page.locator('main')).toBeVisible()
})
```

## Mocking

### Mock de $fetch

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
  expect(result).toHaveLength(1)
})
```

### Mock de Composable

```typescript
import { vi } from 'vitest'

vi.mock('~/composables/useUsers', () => ({
  useUsers: () => ({
    users: ref([{ id: '1', name: 'João' }]),
    isLoading: ref(false),
    fetchUsers: vi.fn()
  })
}))
```

## Boas Práticas

### Nomenclatura

```typescript
// ✅ BOM - Descreve comportamento
it('should show error when email is invalid', () => {})
it('should redirect to login when not authenticated', () => {})

// ❌ RUIM - Vago
it('test 1', () => {})
it('works', () => {})
```

### Arrange-Act-Assert (AAA)

```typescript
it('should add item to cart', () => {
  // Arrange
  const cart = useCartStore()
  const product = { id: '1', name: 'Product' }

  // Act
  cart.addItem(product)

  // Assert
  expect(cart.items).toContainEqual(product)
})
```

### Data-testid para E2E

```vue
<!-- ✅ BOM - Seletor estável -->
<button data-testid="submit-button">Enviar</button>

<!-- ❌ RUIM - Seletor frágil -->
<button class="btn btn-primary">Enviar</button>
```

## Configuração

### vitest.config.ts

```typescript
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: { domEnvironment: 'happy-dom' }
    },
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**/*']
  }
})
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

## Referências

- [Nuxt Test Utils](https://nuxt.com/docs/getting-started/testing)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library Vue](https://testing-library.com/docs/vue-testing-library/intro)
