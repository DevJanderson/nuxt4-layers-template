<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { actionCardVariants, type ActionCardVariants } from '.'

const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: ActionCardVariants['variant']
  size?: ActionCardVariants['size']
}>()
</script>

<template>
  <div :class="cn(actionCardVariants({ variant, size }), props.class)">
    <slot />
  </div>
</template>
