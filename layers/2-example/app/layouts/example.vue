<script setup lang="ts">
/**
 * Layout específico da Feature Layer
 *
 * Uso na página:
 * definePageMeta({
 *   layout: 'example'
 * })
 */
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header específico da feature -->
    <header class="border-b bg-card">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex items-center gap-4">
          <NuxtLink to="/" class="text-muted-foreground hover:text-foreground">
            Voltar
          </NuxtLink>
          <span class="text-muted-foreground">/</span>
          <span class="font-semibold">Example</span>
        </nav>
      </div>
    </header>

    <!-- Conteúdo da página -->
    <main class="container mx-auto px-4 py-6">
      <slot />
    </main>

    <!-- Footer específico (opcional) -->
    <footer class="border-t mt-auto">
      <div class="container mx-auto px-4 py-4 text-center text-muted-foreground text-sm">
        Feature Layer Example
      </div>
    </footer>
  </div>
</template>
