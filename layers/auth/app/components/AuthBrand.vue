<script setup lang="ts">
const config = useRuntimeConfig()
const siteName = computed(() => (config.public.siteName as string) || 'Minha Plataforma')
const siteDescription = computed(() => (config.public.siteDescription as string) || '')
</script>

<template>
  <div class="text-center">
    <h1 class="text-2xl font-bold text-primary-950">{{ siteName }}</h1>
    <p v-if="siteDescription" class="mt-2 text-sm text-muted-foreground">{{ siteDescription }}</p>
  </div>
</template>
