<script setup lang="ts">
const config = useRuntimeConfig()
const siteName = computed(() => (config.public.siteName as string) || 'Minha Plataforma')
</script>

<template>
  <p class="text-center text-xs text-muted-foreground">
    &copy; {{ new Date().getFullYear() }} {{ siteName }}
  </p>
</template>
