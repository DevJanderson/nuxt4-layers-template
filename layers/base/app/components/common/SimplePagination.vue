<script setup lang="ts">
interface Props {
  total: number
  perPage: number
  currentPage: number
  pages: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()
</script>

<template>
  <div v-if="props.pages > 1" class="mt-4 flex justify-center">
    <Pagination
      :total="props.total"
      :items-per-page="props.perPage"
      :sibling-count="1"
      show-edges
      :default-page="props.currentPage"
      @update:page="emit('update:page', $event)"
    >
      <PaginationContent>
        <PaginationFirst />
        <PaginationPrevious />
        <PaginationItem v-for="item in props.pages" :key="item" :value="item" />
        <PaginationNext />
        <PaginationLast />
      </PaginationContent>
    </Pagination>
  </div>
</template>
