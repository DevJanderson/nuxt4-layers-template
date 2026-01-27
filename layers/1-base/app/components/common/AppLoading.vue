<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

defineProps<{
  size?: 'sm' | 'md' | 'lg'
  text?: string
}>()

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
}
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <Loader2
      :class="[sizeClasses[size || 'md'], 'animate-spin']"
    />
    <span v-if="text" class="text-sm text-muted-foreground">
      {{ text }}
    </span>
  </div>
</template>
