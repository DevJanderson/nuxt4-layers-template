<script setup lang="ts">
const route = useRoute()
const showHeader = computed(() => route.meta.header !== false)
const showFooter = computed(() => route.meta.footer !== false)
</script>

<template>
  <div class="flex flex-col">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-9999 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-primary-800"
    >
      Pular para o conteúdo principal
    </a>
    <CommonAppHeader v-if="showHeader" />
    <main id="main-content" class="flex flex-col">
      <slot />
    </main>
    <CommonAppFooter v-if="showFooter" />
  </div>
</template>
