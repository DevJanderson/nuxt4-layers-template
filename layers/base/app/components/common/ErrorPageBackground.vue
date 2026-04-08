<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'discreto' | 'chamativo'
  }>(),
  { variant: 'discreto' }
)
</script>

<template>
  <div
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    :class="variant === 'discreto' ? 'bg-secondary-50' : 'bg-background'"
  >
    <!-- Losangos concêntricos decorativos (variante chamativo) -->
    <NuxtImg
      v-if="variant === 'chamativo'"
      src="/illustrations/error-losangos.svg"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 h-full w-full object-cover"
    />

    <!-- Conteúdo -->
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>
