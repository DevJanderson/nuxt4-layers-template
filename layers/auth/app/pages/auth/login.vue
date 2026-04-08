<script setup lang="ts">
definePageMeta({
  layout: false
})

useSeoPage({
  title: 'Login'
})

const route = useRoute()

// Pegar redirect da query string (com validação de segurança)
const redirectTo = computed(() => {
  const redirect = route.query.redirect as string | undefined
  return getSafeRedirectUrl(redirect, '/')
})
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center px-4 py-6 sm:py-12">
    <!-- Background image -->
    <div class="absolute inset-0 bg-login" />
    <div class="absolute inset-0 bg-base-950/60" />

    <Card class="relative z-10 w-full max-w-md">
      <CardHeader class="space-y-1 text-center">
        <AuthBrand />
      </CardHeader>

      <CardContent>
        <AuthLoginForm :redirect-to="redirectTo" />
      </CardContent>

      <CardFooter class="justify-center">
        <AuthFooter />
      </CardFooter>
    </Card>
  </main>
</template>
