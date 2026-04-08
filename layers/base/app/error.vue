<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

const title = computed(() => {
  if (is404.value) return 'Página não encontrada!'
  return 'Ocorreu um erro!'
})

const description = computed(() => {
  if (is404.value) return 'A página que você procura não foi encontrada.'
  return props.error.message || 'Algo deu errado. Tente novamente mais tarde.'
})

const errorCode = computed(() => {
  if (is404.value) return 'Código do erro: Erro 404'
  return `Código do erro: Erro ${props.error.statusCode}`
})

useSeoPage({
  title: is404.value ? 'Página não encontrada' : 'Erro'
})

function handleGoHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <CommonErrorPageBackground variant="discreto">
    <CommonErrorPageContent
      :title="title"
      :description="description"
      :error-code="errorCode"
      :show-home-link="is404"
      @action="handleGoHome"
    />
  </CommonErrorPageBackground>
</template>
