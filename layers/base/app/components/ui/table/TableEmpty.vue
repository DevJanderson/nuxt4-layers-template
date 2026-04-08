<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import TableCell from './TableCell.vue'
import TableRow from './TableRow.vue'

const { class: propClass = undefined, colspan = 1 } = defineProps<{
  class?: HTMLAttributes['class']
  colspan?: number
}>()
</script>

<template>
  <TableRow>
    <TableCell
      :class="cn('p-4 whitespace-nowrap align-middle text-sm text-foreground', propClass)"
      :colspan="colspan"
    >
      <div class="flex items-center justify-center py-10">
        <slot />
      </div>
    </TableCell>
  </TableRow>
</template>
