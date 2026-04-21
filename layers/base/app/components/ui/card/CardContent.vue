<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/layers/base/app/utils/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('p-6 pt-0', props.class)">
    <slot />
  </div>
</template>
