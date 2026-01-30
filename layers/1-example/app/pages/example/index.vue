<script setup lang="ts">
/**
 * Página de exemplo do módulo Layers
 * Demonstra a estrutura e padrões do template
 */

definePageMeta({
  layout: 'default'
})

const features = [
  {
    title: 'Composables',
    description: 'Todos os composables ficam em app/composables/, seguindo o padrão Nuxt.',
    path: 'composables/'
  },
  {
    title: 'Types',
    description: 'Tipos específicos do módulo em composables/types.ts.',
    path: 'composables/types.ts'
  },
  {
    title: 'Auto-imports',
    description: 'Composables são auto-importados automaticamente pelo Nuxt.',
    path: 'nuxt.config.ts'
  }
]
</script>

<template>
  <main class="min-h-screen flex flex-col justify-center container mx-auto px-4 py-12">
    <!-- Hero Section -->
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h1 class="text-4xl font-bold tracking-tight mb-4">
        Módulo de Exemplo
      </h1>
      <p class="text-lg text-muted-foreground">
        Este módulo demonstra a arquitetura de Layers para Nuxt 4.
        Use como referência para criar seus próprios módulos.
      </p>
    </div>

    <!-- Features Grid -->
    <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
      >
        <h3 class="font-semibold text-lg mb-2">{{ feature.title }}</h3>
        <p class="text-sm text-muted-foreground mb-3">{{ feature.description }}</p>
        <code class="text-xs bg-muted px-2 py-1 rounded">{{ feature.path }}</code>
      </div>
    </div>

    <!-- Instructions -->
    <div class="max-w-2xl mx-auto">
      <div class="p-6 rounded-lg border bg-muted/50">
        <h2 class="font-semibold text-lg mb-4">Como criar um novo módulo</h2>
        <ol class="space-y-3 text-sm text-muted-foreground">
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</span>
            <span>Crie uma pasta em <code class="bg-background px-1.5 py-0.5 rounded text-foreground">layers/</code> com prefixo numérico (ex: <code class="bg-background px-1.5 py-0.5 rounded text-foreground">3-meu-modulo</code>)</span>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">2</span>
            <span>Adicione <code class="bg-background px-1.5 py-0.5 rounded text-foreground">nuxt.config.ts</code> e a estrutura <code class="bg-background px-1.5 py-0.5 rounded text-foreground">app/</code></span>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">3</span>
            <span>Coloque composables em <code class="bg-background px-1.5 py-0.5 rounded text-foreground">app/composables/</code> e páginas em <code class="bg-background px-1.5 py-0.5 rounded text-foreground">app/pages/</code></span>
          </li>
        </ol>
      </div>

      <div class="mt-6 text-center">
        <Button variant="outline" @click="navigateTo('/')">
          Voltar para Home
        </Button>
      </div>
    </div>
  </main>
</template>
