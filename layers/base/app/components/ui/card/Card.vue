<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/layers/base/app/utils/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('rounded-lg border bg-card text-card-foreground shadow-sm', props.class)">
    <slot />
  </div>
</template>
