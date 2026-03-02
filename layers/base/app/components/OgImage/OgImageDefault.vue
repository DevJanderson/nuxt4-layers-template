<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  siteName?: string
}>()
</script>

<template>
  <div
    class="flex h-full w-full flex-col items-center justify-center bg-neutral-950 px-16 text-white"
  >
    <h1 class="text-6xl font-bold leading-tight">
      {{ title || 'Nuxt 4 Layers Template' }}
    </h1>
    <p v-if="description" class="mt-4 text-2xl text-neutral-400">
      {{ description }}
    </p>
    <p class="mt-8 text-lg text-neutral-500">
      {{ siteName || 'nuxt4-layers-template' }}
    </p>
  </div>
</template>
