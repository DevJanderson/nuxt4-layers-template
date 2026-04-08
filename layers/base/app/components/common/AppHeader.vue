<script setup lang="ts">
const appConfig = useAppConfig()
const route = useRoute()

const mobileMenuOpen = ref(false)

// Fecha menu mobile ao navegar
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  }
)

// Verifica se o link está ativo
function isActive(to: string) {
  if (to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(to)
}
</script>

<template>
  <header class="relative z-50 border-b border-base-100 bg-background px-4 py-3 md:px-6">
    <div class="mx-auto flex items-center gap-4 lg:gap-10">
      <!-- Logo (esquerda) -->
      <div class="flex shrink-0 items-center">
        <NuxtLink to="/">
          <NuxtImg :src="appConfig.brand.logo.default" alt="Logo" class="h-6 sm:h-8" />
        </NuxtLink>
      </div>

      <!-- Navegação Central (Desktop) -->
      <nav
        aria-label="Navegação principal"
        class="hidden flex-1 items-center justify-center gap-6 lg:flex"
      >
        <NuxtLink
          v-for="link in appConfig.nav"
          :key="link.to"
          :to="link.to"
          class="relative flex items-center gap-1.5 rounded-sm text-base transition-colors outline-none after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:rounded-full after:bg-current after:transition-transform after:duration-300 after:ease-out"
          :class="[
            isActive(link.to)
              ? 'font-semibold text-primary-950 hover:after:scale-x-100'
              : 'font-normal text-secondary-800 hover:text-secondary-950 hover:after:scale-x-100'
          ]"
        >
          <svg
            v-if="isActive(link.to)"
            class="size-3 shrink-0 text-primary-700"
            viewBox="0 0 11 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.621338 6.62134C-0.207089 5.79291 -0.207089 4.44976 0.621338 3.62134L3.62134 0.621338C4.44977 -0.207089 5.79291 -0.207089 6.62134 0.621338L9.62134 3.62134C10.4498 4.44976 10.4498 5.79291 9.62134 6.62134L6.62134 9.62134C5.79291 10.4498 4.44977 10.4498 3.62134 9.62134L0.621338 6.62134Z"
              fill="currentColor"
            />
          </svg>
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Ações (direita) -->
      <div class="ml-auto flex items-center gap-2 sm:gap-3">
        <!-- Mobile: Hamburger menu -->
        <Sheet v-model:open="mobileMenuOpen">
          <SheetTrigger as-child>
            <Button variant="outline" size="icon" class="rounded-full lg:hidden" aria-label="Menu">
              <Icon name="lucide:menu" class="size-4" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" hide-close class="flex w-72 flex-col gap-0 border-r-0 p-0">
            <!-- Botão fechar no overlay -->
            <SheetClose
              class="absolute top-5 flex size-9 items-center justify-center rounded-full bg-base-0/10 text-base-0 backdrop-blur-sm transition-colors hover:bg-base-0/20 outline-hidden"
              :style="{ left: 'calc(100vw - 3.25rem)' }"
              aria-label="Fechar menu"
            >
              <Icon name="lucide:x" class="size-4" />
            </SheetClose>

            <!-- Header: identidade da marca -->
            <SheetHeader class="mb-2 px-5 py-5">
              <SheetTitle class="sr-only">Menu de navegação</SheetTitle>
              <NuxtImg :src="appConfig.brand.logo.default" alt="Logo" class="h-8" />
            </SheetHeader>

            <!-- Nav links -->
            <nav aria-label="Navegação principal" class="flex flex-1 flex-col gap-1 px-3 py-4">
              <NuxtLink
                v-for="link in appConfig.nav"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors outline-none"
                :class="[
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary-950'
                    : 'text-base-700 hover:bg-base-50 hover:text-base-900'
                ]"
              >
                <!-- Container do ícone -->
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg border"
                  :class="[
                    isActive(link.to)
                      ? 'border-primary-200 bg-background text-primary-950'
                      : 'border-base-200 text-base-500'
                  ]"
                >
                  <Icon :name="link.icon" class="size-4" />
                </span>
                {{ link.label }}
              </NuxtLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
