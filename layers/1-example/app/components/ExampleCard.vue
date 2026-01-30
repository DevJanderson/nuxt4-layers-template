<script setup lang="ts">
/**
 * Componente de exemplo para Feature Layer
 *
 * Convenções:
 * - Prefixar com nome da feature (Example, Product, User, etc.)
 * - Props tipadas com interface
 * - Emits tipados com defineEmits
 */

interface Props {
  title: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  description: ''
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
    @click="emit('click')"
  >
    <h3 class="font-semibold text-lg">{{ title }}</h3>
    <p v-if="description" class="text-muted-foreground mt-2">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
