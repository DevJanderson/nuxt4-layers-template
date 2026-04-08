<script setup lang="ts">
interface Props {
  icon: string
  label: string
  sublabel?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-center justify-center rounded-lg border border-dashed border-base-200 p-8">
    <div class="text-center">
      <Icon :name="icon" class="mx-auto size-12 text-base-300" />
      <p class="mt-2 text-sm text-base-400">{{ label }}</p>
      <p v-if="sublabel" class="text-xs text-base-300">{{ sublabel }}</p>
    </div>
  </div>
</template>
