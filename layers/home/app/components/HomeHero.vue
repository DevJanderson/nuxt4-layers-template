<script setup lang="ts">
const config = useRuntimeConfig()
const siteName = (config.public.siteName as string) || 'Meu Projeto'
const siteDescription = (config.public.siteDescription as string) || ''
</script>

<template>
  <section class="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
    <h1 class="text-4xl font-bold tracking-tight text-base-950 sm:text-5xl lg:text-6xl">
      {{ siteName }}
    </h1>
    <p v-if="siteDescription" class="mt-6 max-w-2xl text-lg text-base-600">
      {{ siteDescription }}
    </p>
    <div class="mt-10">
      <NuxtLink
        to="/"
        class="rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-base-0 shadow-sm transition hover:bg-primary-500"
      >
        Explorar
      </NuxtLink>
    </div>
  </section>
</template>
