<script setup lang="ts">
const route = useRoute()
const slug = (route.params.slug as string[])?.join('/') || 'index'
const path = `/docs/${slug}`
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <ContentRenderer :path="path">
      <template #default="{ value }">
        <div class="prose dark:prose-invert max-w-none">
          <ContentRendererMarkdown :value="value" />
        </div>
      </template>
      <template #empty>
        <div class="text-center text-muted-foreground">
          <h1 class="text-2xl font-bold">Página não encontrada</h1>
          <p class="mt-2">O documento solicitado não existe.</p>
          <NuxtLink to="/docs" class="mt-4 inline-block text-primary hover:underline">
            Voltar para documentação
          </NuxtLink>
        </div>
      </template>
    </ContentRenderer>
  </div>
</template>
