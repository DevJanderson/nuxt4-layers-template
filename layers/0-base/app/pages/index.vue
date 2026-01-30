<script setup lang="ts">
/**
 * Página inicial do template
 */
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
    <div class="text-center space-y-2">
      <h1 class="text-4xl font-bold tracking-tight">
        Nuxt 4 Layers Template
      </h1>
      <p class="text-muted-foreground">
        Template com shadcn-vue, Tailwind CSS e arquitetura de Layers
      </p>
    </div>

    <div class="flex gap-4">
      <NuxtLink to="/example">
        <Button>Ver módulo de exemplo</Button>
      </NuxtLink>
    </div>
  </div>
</template>
