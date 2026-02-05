<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

const title = computed(() => {
  if (is404.value) return 'Página não encontrada'
  return 'Ocorreu um erro'
})

const description = computed(() => {
  if (is404.value) return 'A página que você está procurando não existe ou foi movida.'
  return props.error.message || 'Algo deu errado. Tente novamente mais tarde.'
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
    <div class="text-center max-w-md">
      <!-- Error Code -->
      <p class="text-6xl font-bold text-muted-foreground/20 sm:text-8xl">
        {{ error.statusCode }}
      </p>

      <!-- Title -->
      <h1 class="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
        {{ title }}
      </h1>

      <!-- Description -->
      <p class="mt-2 text-muted-foreground">
        {{ description }}
      </p>

      <!-- Action -->
      <div class="mt-8">
        <Button @click="handleError">
          Voltar para Home
        </Button>
      </div>
    </div>
  </div>
</template>
